import React from 'react';
import { DatabaseState } from '../types';
import { calculateDashboardStats } from '../lib/calculations';
import { IndianRupee, TrendingUp, TrendingDown, UserPlus, FileSpreadsheet, Download, Upload } from 'lucide-react';

export function Dashboard({ data }: { data: DatabaseState }) {
  const stats = calculateDashboardStats(data);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Spent" value={stats.totalSpent} icon={<IndianRupee className="w-4 h-4 text-slate-500" />} />
        <StatCard title="Average Expense" value={stats.averageExpense} icon={<FileSpreadsheet className="w-4 h-4 text-slate-500" />} />
        <StatCard title="Highest Expense" value={stats.highestExpense || 0} icon={<TrendingUp className="w-4 h-4 text-rose-500" />} />
        <StatCard title="Lowest Expense" value={stats.lowestExpense || 0} icon={<TrendingDown className="w-4 h-4 text-emerald-500" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Top Spender</h3>
          {stats.topSpender ? (
            <div>
              <p className="text-2xl font-semibold text-slate-900">{stats.topSpender.name}</p>
              <p className="text-sm text-slate-500 mt-1">₹{stats.topSpender.amount.toFixed(2)}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not enough data</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Largest Creditor</h3>
          {stats.largestCreditor ? (
            <div>
              <p className="text-2xl font-semibold text-emerald-600">{stats.largestCreditor.name}</p>
              <p className="text-sm text-slate-500 mt-1">Owed ₹{stats.largestCreditor.amount.toFixed(2)}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not enough data</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Largest Debtor</h3>
          {stats.largestDebtor ? (
            <div>
              <p className="text-2xl font-semibold text-rose-600">{stats.largestDebtor.name}</p>
              <p className="text-sm text-slate-500 mt-1">Owes ₹{stats.largestDebtor.amount.toFixed(2)}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Not enough data</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-slate-500">{title}</h3>
        {icon}
      </div>
      <div className="text-2xl font-bold">₹{value.toFixed(2)}</div>
    </div>
  );
}
