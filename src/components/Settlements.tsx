import React, { useMemo, useState } from 'react';
import { Expense, Group, User, Settlement } from '../types';
import { calculateBalances, calculateSettlements } from '../lib/calculations';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function Settlements({ expenses, groups, users }: { expenses: Expense[], groups: Group[], users: User[] }) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  const filteredExpenses = useMemo(() => {
    if (selectedGroupId === 'all') return expenses;
    return expenses.filter(e => e.groupId === selectedGroupId);
  }, [expenses, selectedGroupId]);

  const settlements = useMemo(() => {
    const balances = calculateBalances(filteredExpenses, users);
    return calculateSettlements(balances);
  }, [filteredExpenses, users]);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown User';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Settlements</h2>
        
        <select 
          value={selectedGroupId} 
          onChange={e => setSelectedGroupId(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
        >
          <option value="all">All Groups</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {settlements.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-slate-900">Everyone is settled up!</p>
            <p className="text-sm mt-1">No debts found for the selected group.</p>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-medium text-slate-900">Suggested Repayments</h3>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                {settlements.length} {settlements.length === 1 ? 'Transaction' : 'Transactions'}
              </span>
            </div>
            <div className="space-y-3">
              {settlements.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 shadow-sm rounded-xl hover:border-slate-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                      {getUserName(s.from).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center text-slate-600 text-sm md:space-x-2">
                      <span className="font-semibold text-slate-900 text-base">{getUserName(s.from)}</span>
                      <span className="hidden md:inline text-slate-400">owes</span>
                      <ArrowRight className="w-4 h-4 hidden md:block text-slate-400" />
                      <span className="font-semibold text-slate-900 text-base">{getUserName(s.to)}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                    ₹{s.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
