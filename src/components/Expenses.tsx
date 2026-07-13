import React, { useState } from 'react';
import { Expense, Group, User } from '../types';
import { api } from '../api';
import { Pencil, Trash2 } from 'lucide-react';

export function Expenses({ expenses, groups, users, refresh }: { expenses: Expense[], groups: Group[], users: User[], refresh: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitAmong, setSplitAmong] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (e: Expense) => {
    setEditingId(e.id);
    setGroupId(e.groupId);
    setTitle(e.title);
    setAmount(e.amount.toString());
    setPaidBy(e.paidBy);
    setSplitAmong(e.splitAmong);
    setDate(e.date);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setGroupId('');
    setTitle('');
    setAmount('');
    setPaidBy('');
    setSplitAmong([]);
    setDate('');
    setError('');
  };

  const toggleSplitUser = (userId: string) => {
    if (splitAmong.includes(userId)) {
      setSplitAmong(splitAmong.filter(id => id !== userId));
    } else {
      setSplitAmong([...splitAmong, userId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (splitAmong.length === 0) {
      setError('You must select at least one user to split among.');
      return;
    }

    const payload = {
      groupId, title, amount: parseFloat(amount), paidBy, splitAmong, date: date || new Date().toISOString()
    };

    try {
      if (editingId) {
        await api.updateExpense(editingId, payload);
      } else {
        await api.createExpense(payload);
      }
      refresh();
      cancelEdit();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const confirmDelete = async (id: string) => {
    await api.deleteExpense(id);
    refresh();
    setDeleteConfirmId(null);
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || 'Unknown';

  if (groups.length === 0 || users.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        Please add at least one group and one user before creating expenses.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Expenses</h2>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
          <h3 className="font-medium text-slate-900 mb-4">{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-rose-500 bg-rose-50 p-2 rounded">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
              <select required value={groupId} onChange={e => setGroupId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                <option value="" disabled>Select Group</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="Dinner" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input required type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="100.00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Paid By</label>
              <select required value={paidBy} onChange={e => setPaidBy(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                <option value="" disabled>Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Split Among</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2 bg-white">
                {users.map(u => (
                  <label key={u.id} className="flex items-center space-x-2">
                    <input type="checkbox" checked={splitAmong.includes(u.id)} onChange={() => toggleSplitUser(u.id)} className="rounded text-slate-900 focus:ring-slate-500" />
                    <span className="text-sm">{u.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                {editingId ? 'Save' : 'Add Expense'}
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
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Group</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Paid By</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{e.title}</td>
                  <td className="px-6 py-4 text-slate-500">{getGroupName(e.groupId)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">₹{e.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500">{getUserName(e.paidBy)}</td>
                  <td className="px-6 py-4 text-right">
                    {deleteConfirmId === e.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-xs text-rose-500 font-medium">Delete?</span>
                        <button type="button" onClick={() => confirmDelete(e.id)} className="px-2 py-1 bg-rose-500 text-white text-xs rounded hover:bg-rose-600">Yes</button>
                        <button type="button" onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300">No</button>
                      </div>
                    ) : (
                      <>
                        <button type="button" onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setDeleteConfirmId(e.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No expenses found. Add some to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
