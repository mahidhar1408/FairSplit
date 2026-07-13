import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api';
import { Pencil, Trash2 } from 'lucide-react';

export function Users({ users, refresh }: { users: User[], refresh: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState('');

  const handleEdit = (u: User) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setInitialBalance((u.initialBalance || 0).toString());
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setInitialBalance('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const parsedBalance = parseFloat(initialBalance) || 0;
      if (editingId) {
        await api.updateUser(editingId, { name, email, initialBalance: parsedBalance });
      } else {
        await api.createUser({ name, email, initialBalance: parsedBalance });
      }
      refresh();
      cancelEdit();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await api.deleteUser(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
          <h3 className="font-medium text-slate-900 mb-4">{editingId ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-rose-500 bg-rose-50 p-2 rounded">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Starting Balance (₹)</label>
              <input type="number" step="0.01" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="0.00" />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                {editingId ? 'Save' : 'Add User'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="flex-1 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Starting Bal</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4 text-slate-500">₹{(u.initialBalance || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(u)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No users found. Add some to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
