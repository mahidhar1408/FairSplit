/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users as UsersIcon, Home, FolderKanban, Receipt, ArrowLeftRight, Settings as SettingsIcon } from 'lucide-react';
import { api } from './api';
import { DatabaseState } from './types';

import { Dashboard } from './components/Dashboard';
import { Users } from './components/Users';
import { Groups } from './components/Groups';
import { Expenses } from './components/Expenses';
import { Settlements } from './components/Settlements';
import { Settings } from './components/Settings';

type Tab = 'dashboard' | 'users' | 'groups' | 'expenses' | 'settlements' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getData();
      setData(res);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Loading Application...</div>
      </div>
    );
  }

  const NavButton = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
        activeTab === tab 
          ? 'bg-slate-900 text-white' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">FairSplit</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavButton tab="dashboard" icon={Home} label="Dashboard" />
          <NavButton tab="users" icon={UsersIcon} label="Users" />
          <NavButton tab="groups" icon={FolderKanban} label="Groups" />
          <NavButton tab="expenses" icon={Receipt} label="Expenses" />
          <NavButton tab="settlements" icon={ArrowLeftRight} label="Settlements" />
          <NavButton tab="settings" icon={SettingsIcon} label="Settings" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {activeTab === 'dashboard' && <Dashboard data={data} />}
          {activeTab === 'users' && <Users users={data.users} refresh={loadData} />}
          {activeTab === 'groups' && <Groups groups={data.groups} refresh={loadData} />}
          {activeTab === 'expenses' && <Expenses expenses={data.expenses} groups={data.groups} users={data.users} refresh={loadData} />}
          {activeTab === 'settlements' && <Settlements expenses={data.expenses} groups={data.groups} users={data.users} />}
          {activeTab === 'settings' && <Settings data={data} refresh={loadData} />}
        </div>
      </div>
    </div>
  );
}
