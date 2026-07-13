import { Expense, Settlement, DatabaseState, User } from '../types';

export function calculateBalances(expenses: Expense[], users: User[]) {
  const balances: Record<string, number> = {};

  for (const user of users) {
    balances[user.id] = user.initialBalance || 0;
  }

  for (const exp of expenses) {
    if (!balances[exp.paidBy]) balances[exp.paidBy] = 0;
    balances[exp.paidBy] += exp.amount;

    const splitAmount = exp.amount / exp.splitAmong.length;
    for (const userId of exp.splitAmong) {
      if (!balances[userId]) balances[userId] = 0;
      balances[userId] -= splitAmount;
    }
  }

  return balances;
}

export function calculateSettlements(balances: Record<string, number>): Settlement[] {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  for (const [id, amount] of Object.entries(balances)) {
    if (amount < -0.01) debtors.push({ id, amount: Math.abs(amount) });
    else if (amount > 0.01) creditors.push({ id, amount });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let d = 0, c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    
    const amount = Math.min(debtor.amount, creditor.amount);
    
    if (amount > 0.01) {
      settlements.push({ from: debtor.id, to: creditor.id, amount });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  return settlements;
}

export function calculateDashboardStats(data: DatabaseState) {
  const { users, expenses } = data;
  
  if (expenses.length === 0) {
    return {
      highestExpense: null,
      lowestExpense: null,
      averageExpense: 0,
      topSpender: null,
      largestCreditor: null,
      largestDebtor: null,
      totalSpent: 0
    };
  }

  const amounts = expenses.map(e => e.amount);
  const highest = Math.max(...amounts);
  const lowest = Math.min(...amounts);
  const total = amounts.reduce((sum, val) => sum + val, 0);
  const average = total / amounts.length;

  // Top Spender
  const spenders: Record<string, number> = {};
  for (const e of expenses) {
    spenders[e.paidBy] = (spenders[e.paidBy] || 0) + e.amount;
  }
  let topSpenderId = Object.keys(spenders).reduce((a, b) => spenders[a] > spenders[b] ? a : b, '');

  const balances = calculateBalances(expenses, users);
  let maxCredit = 0;
  let maxDebit = 0;
  let largestCreditorId = '';
  let largestDebtorId = '';

  for (const [id, bal] of Object.entries(balances)) {
    if (bal > maxCredit) {
      maxCredit = bal;
      largestCreditorId = id;
    }
    if (bal < maxDebit) {
      maxDebit = bal;
      largestDebtorId = id;
    }
  }

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown User';

  return {
    highestExpense: highest,
    lowestExpense: lowest,
    averageExpense: average,
    totalSpent: total,
    topSpender: topSpenderId ? { name: getUserName(topSpenderId), amount: spenders[topSpenderId] } : null,
    largestCreditor: largestCreditorId ? { name: getUserName(largestCreditorId), amount: maxCredit } : null,
    largestDebtor: largestDebtorId ? { name: getUserName(largestDebtorId), amount: Math.abs(maxDebit) } : null,
  };
}
