export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  joined: string;
  orders: number;
  spent: number;
}

const names = [
  ['Ava Patel', 'ava.patel@example.com'],
  ['Noah Johnson', 'noah.j@example.com'],
  ['Mia Chen', 'mia.chen@example.com'],
  ['Liam Rodriguez', 'liam.r@example.com'],
  ['Emma Williams', 'emma.w@example.com'],
  ['Oliver Singh', 'oliver.s@example.com'],
  ['Sophia Gomez', 'sophia.g@example.com'],
  ['Ethan Brown', 'ethan.b@example.com'],
  ['Isabella Kim', 'bella.kim@example.com'],
  ['Aarav Shah', 'aarav.shah@example.com'],
  ['Zara Ali', 'zara.ali@example.com'],
  ['Daniel Müller', 'dan.mueller@example.com'],
];

const roles: ('user' | 'seller' | 'admin')[] = ['user', 'user', 'user', 'user', 'seller', 'seller', 'admin'];
const statuses: ('active' | 'suspended' | 'pending')[] = ['active', 'active', 'active', 'pending', 'suspended'];

export const ADMIN_USERS: AdminUserRow[] = names.map(([name, email], i) => ({
  id: `U-${1200 + i}`,
  name,
  email,
  role: roles[i % roles.length],
  status: statuses[i % statuses.length],
  joined: new Date(Date.now() - (i + 3) * 86400000 * 5).toISOString(),
  orders: Math.floor(Math.random() * 40),
  spent: Math.round(Math.random() * 3200 * 100) / 100,
}));
