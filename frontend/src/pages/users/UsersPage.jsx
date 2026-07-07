import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { ShieldCheck, Plus, Trash2, Edit } from 'lucide-react';
import AddUserModal from '../../components/users/AddUserModal';
import EditUserModal from '../../components/users/EditUserModal';

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  // Extra security: If user is somehow here but not an ADMIN, don't fetch
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    fetchUsers();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('دڵنیایت لە سڕینەوەی ئەم کارمەندە؟ ئەم کارە هەڵناوەشێتەوە!')) return;
    
    try {
      const response = await axios.delete(`/users/${id}`);
      if (response.data.success) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      alert(error.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی سڕینەوەی کارمەند');
    }
  };

  const handleEditClick = (u) => {
    setUserToEdit(u);
    setIsEditModalOpen(true);
  };

  if (user?.role !== 'ADMIN') {
    return <div className="text-center text-destructive p-8 font-bold text-xl">تۆ دەسەڵاتی بینینی ئەم پەڕەیەت نییە.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">بەکارهێنەران</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            بەڕێوەبردنی کارمەندانی ئایتی و بینەران
          </p>
        </div>
        
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          کارمەندی نوێ
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-muted/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 font-medium">ناو</th>
              <th className="px-4 py-3 font-medium">ناوی بەکارهێنەر</th>
              <th className="px-4 py-3 font-medium">دەسەڵات (ڕۆڵ)</th>
              <th className="px-4 py-3 font-medium">بەرواری دروستبوون</th>
              <th className="px-4 py-3 font-medium w-[100px]">کردارەکان</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8 font-bold text-slate-500 dark:text-slate-400">دەهێنرێت...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 font-bold text-slate-500 dark:text-slate-400">هیچ بەکارهێنەرێک نییە.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{u.name}</td>
                  <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300" dir="ltr" style={{ textAlign: 'right' }}>{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold
                      ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : ''}
                      ${u.role === 'IT_STAFF' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                      ${u.role === 'VIEWER' ? 'bg-slate-50 text-slate-700 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : ''}
                    `}>
                      {u.role === 'ADMIN' && <ShieldCheck size={14} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400" dir="ltr">{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg" onClick={() => handleEditClick(u)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" disabled={u.id === user.id} title={u.id === user.id ? "ناتوانیت خۆت بسڕیتەوە" : ""} onClick={() => handleDelete(u.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={(newUser) => setUsers([newUser, ...users])}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onUpdated={(updatedUser) => {
          setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        }}
      />
    </div>
  );
};

export default UsersPage;
