import { User, Group, Expense, DatabaseState } from './types';

const API_BASE = '/api';

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, { ...options, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  getData: () => fetchJSON(`${API_BASE}/data`) as Promise<DatabaseState>,
  
  getUsers: () => fetchJSON(`${API_BASE}/users`) as Promise<User[]>,
  createUser: (user: Omit<User, 'id'>) => fetchJSON(`${API_BASE}/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user)
  }),
  updateUser: (id: string, user: Omit<User, 'id'>) => fetchJSON(`${API_BASE}/users/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user)
  }),
  deleteUser: (id: string) => fetchJSON(`${API_BASE}/users/${id}`, { method: 'DELETE' }),

  getGroups: () => fetchJSON(`${API_BASE}/groups`) as Promise<Group[]>,
  createGroup: (group: Omit<Group, 'id'>) => fetchJSON(`${API_BASE}/groups`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(group)
  }),
  updateGroup: (id: string, group: Omit<Group, 'id'>) => fetchJSON(`${API_BASE}/groups/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(group)
  }),
  deleteGroup: (id: string) => fetchJSON(`${API_BASE}/groups/${id}`, { method: 'DELETE' }),

  getExpenses: () => fetchJSON(`${API_BASE}/expenses`) as Promise<Expense[]>,
  createExpense: (expense: Omit<Expense, 'id'>) => fetchJSON(`${API_BASE}/expenses`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expense)
  }),
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => fetchJSON(`${API_BASE}/expenses/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expense)
  }),
  deleteExpense: (id: string) => fetchJSON(`${API_BASE}/expenses/${id}`, { method: 'DELETE' }),

  restoreDatabase: (data: any) => fetchJSON(`${API_BASE}/restore`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  })
};
