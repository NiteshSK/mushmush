import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  
  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  
  return session.user;
}
