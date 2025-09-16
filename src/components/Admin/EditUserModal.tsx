"use client";
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string; email: string; role: 'ADMIN' | 'CUSTOMER' } | null;
  onUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUpdated }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CUSTOMER'>('CUSTOMER');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setRole(user.role);
      setPassword('');
    }
  }, [user]);

  const handleClose = () => {
    setName('');
    setRole('CUSTOMER');
    setPassword('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, name, role, password: password.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update user');
        setLoading(false);
        return;
      }
      toast.success('User updated');
      onUpdated();
      handleClose();
    } catch (err) {
      console.error('Update user error', err);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-dark">Edit User</h2>
          <button onClick={handleClose} className="text-gray-5 hover:text-dark">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Full Name</label>
            <input className="w-full px-3 py-2 border border-gray-3 rounded-lg" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Email</label>
            <input className="w-full px-3 py-2 border border-gray-3 rounded-lg bg-gray-1" value={user.email} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Role</label>
            <select className="w-full px-3 py-2 border border-gray-3 rounded-lg" value={role} onChange={(e)=>setRole(e.target.value as 'ADMIN'|'CUSTOMER')}>
              <option value="ADMIN">Admin</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">New Password (optional)</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-3 rounded-lg" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Leave blank to keep existing" />
            <p className="text-xs text-gray-5 mt-1">Must meet password policy if provided.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 px-4 py-2 border border-gray-3 text-gray-6 rounded-lg hover:bg-gray-1">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-dark disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;


