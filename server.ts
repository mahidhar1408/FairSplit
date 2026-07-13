import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createServer as createViteServer } from 'vite';

const DATA_FILE = path.join(process.cwd(), 'data.json');

const defaultData = {
  users: [],
  groups: [],
  expenses: []
};

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return defaultData;
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  app.get('/api/data', (req, res) => {
    res.json(readData());
  });

  // USERS
  app.get('/api/users', (req, res) => {
    res.json(readData().users);
  });

  app.post('/api/users', (req, res) => {
    const data = readData();
    const { name, email, initialBalance } = req.body;
    
    // Validation: case-insensitive check for duplicate name or email
    const duplicate = data.users.find((u: any) => 
      u.name.toLowerCase() === name.toLowerCase() || 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (duplicate) {
      return res.status(400).json({ error: 'User with this name or email already exists.' });
    }

    const newUser = { id: uuidv4(), name, email, initialBalance: initialBalance || 0 };
    data.users.push(newUser);
    writeData(data);
    res.json(newUser);
  });

  app.put('/api/users/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    const { name, email, initialBalance } = req.body;
    
    const index = data.users.findIndex((u: any) => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    
    // Check duplicates but exclude current user
    const duplicate = data.users.find((u: any) => 
      u.id !== id && (
        u.name.toLowerCase() === name.toLowerCase() || 
        u.email.toLowerCase() === email.toLowerCase()
      )
    );
    if (duplicate) {
      return res.status(400).json({ error: 'User with this name or email already exists.' });
    }

    data.users[index] = { ...data.users[index], name, email, initialBalance: initialBalance || 0 };
    writeData(data);
    res.json(data.users[index]);
  });

  app.delete('/api/users/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    data.users = data.users.filter((u: any) => u.id !== id);
    // Cleanup expenses related to user? Handled frontend or here if needed
    writeData(data);
    res.json({ success: true });
  });

  // GROUPS
  app.get('/api/groups', (req, res) => {
    res.json(readData().groups);
  });

  app.post('/api/groups', (req, res) => {
    const data = readData();
    const { name, description } = req.body;
    
    const duplicate = data.groups.find((g: any) => g.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ error: 'Group with this name already exists.' });
    }

    const newGroup = { id: uuidv4(), name, description };
    data.groups.push(newGroup);
    writeData(data);
    res.json(newGroup);
  });

  app.put('/api/groups/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    const { name, description } = req.body;
    
    const index = data.groups.findIndex((g: any) => g.id === id);
    if (index === -1) return res.status(404).json({ error: 'Group not found' });

    const duplicate = data.groups.find((g: any) => g.id !== id && g.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return res.status(400).json({ error: 'Group with this name already exists.' });
    }

    data.groups[index] = { ...data.groups[index], name, description };
    writeData(data);
    res.json(data.groups[index]);
  });

  app.delete('/api/groups/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    data.groups = data.groups.filter((g: any) => g.id !== id);
    // Remove related expenses
    data.expenses = data.expenses.filter((e: any) => e.groupId !== id);
    writeData(data);
    res.json({ success: true });
  });

  // EXPENSES
  app.get('/api/expenses', (req, res) => {
    res.json(readData().expenses);
  });

  app.post('/api/expenses', (req, res) => {
    const data = readData();
    const { groupId, title, amount, paidBy, splitAmong, date } = req.body;
    
    // Negative transaction block
    if (amount <= 0) {
      return res.status(400).json({ error: 'Expense amount must be positive.' });
    }

    const newExpense = { id: uuidv4(), groupId, title, amount, paidBy, splitAmong, date: date || new Date().toISOString() };
    data.expenses.push(newExpense);
    writeData(data);
    res.json(newExpense);
  });

  app.put('/api/expenses/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    const { groupId, title, amount, paidBy, splitAmong, date } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Expense amount must be positive.' });
    }

    const index = data.expenses.findIndex((e: any) => e.id === id);
    if (index === -1) return res.status(404).json({ error: 'Expense not found' });

    data.expenses[index] = { ...data.expenses[index], groupId, title, amount, paidBy, splitAmong, date };
    writeData(data);
    res.json(data.expenses[index]);
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    data.expenses = data.expenses.filter((e: any) => e.id !== id);
    writeData(data);
    res.json({ success: true });
  });

  // RESTORE (Upload JSON)
  app.post('/api/restore', (req, res) => {
    try {
      const newData = req.body;
      if (!newData.users || !newData.groups || !newData.expenses) {
        return res.status(400).json({ error: 'Invalid backup format' });
      }
      writeData(newData);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to restore database' });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
