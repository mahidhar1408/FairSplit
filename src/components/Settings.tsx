import React, { useRef, useState } from 'react';
import { DatabaseState } from '../types';
import { api } from '../api';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Settings({ data, refresh }: { data: DatabaseState, refresh: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  const handleExport = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'database_backup.json';
    link.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        await api.restoreDatabase(parsed);
        setStatus({ type: 'success', message: 'Database restored successfully!' });
        refresh();
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to restore database. Invalid file format.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h2>

      {status && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-1">Backup Database</h3>
          <p className="text-sm text-slate-500 mb-4">Export all users, groups, and expenses to a JSON file. This file can be used to restore your data later.</p>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup</span>
          </button>
        </div>

        <div className="p-6 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900 mb-1">Restore Database</h3>
          <p className="text-sm text-slate-500 mb-4">Upload a previously exported database_backup.json file. Warning: This will overwrite your current data.</p>
          
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Backup File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
