import React, { useState } from 'react';
import { Group } from '../types';
import { api } from '../api';
import { Pencil, Trash2 } from 'lucide-react';

export function Groups({ groups, refresh }: { groups: Group[], refresh: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleEdit = (g: Group) => {
    setEditingId(g.id);
    setName(g.name);
    setDescription(g.description);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateGroup(editingId, { name, description });
      } else {
        await api.createGroup({ name, description });
      }
      refresh();
      cancelEdit();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const confirmDelete = async (id: string) => {
    await api.deleteGroup(id);
    refresh();
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Groups</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
          <h3 className="font-medium text-slate-900 mb-4">{editingId ? 'Edit Group' : 'Add New Group'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-rose-500 bg-rose-50 p-2 rounded">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" placeholder="Trip to Goa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[100px]" placeholder="Summer trip expenses..." />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                {editingId ? 'Save' : 'Add Group'}
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
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {groups.map(g => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{g.name}</td>
                  <td className="px-6 py-4 text-slate-500">{g.description}</td>
                  <td className="px-6 py-4 text-right">
                    {deleteConfirmId === g.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-xs text-rose-500 font-medium">Delete?</span>
                        <button type="button" onClick={() => confirmDelete(g.id)} className="px-2 py-1 bg-rose-500 text-white text-xs rounded hover:bg-rose-600">Yes</button>
                        <button type="button" onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300">No</button>
                      </div>
                    ) : (
                      <>
                        <button type="button" onClick={() => handleEdit(g)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setDeleteConfirmId(g.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No groups found. Add some to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
