import { useState } from 'react';
import axios from '../../services/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddUserModal = ({ isOpen, onClose, onAdded }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('تکایە هەموو زانیارییەکان پڕبکەرەوە');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/users', { 
        name, 
        username, 
        password, 
        role 
      });
      
      if (response.data.success) {
        onAdded(response.data.data);
        setName('');
        setUsername('');
        setPassword('');
        setRole('VIEWER');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی زیادکردنی بەکارهێنەر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-5 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <UserPlus size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">زیادکردنی کارمەند</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <form id="add-user-form" onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="ناوی سیانی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نموونە: ئەحمەد محەمەد عەلی"
                required
              />
              
              <Input
                label="ناوی بەکارهێنەر"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نموونە: ahmad"
                required
                dir="ltr"
              />

              <Input
                label="وشەی تێپەڕ (پاسۆرد)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="پاسۆردێک بنووسە"
                required
                dir="ltr"
              />

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  دەسەڵات (ڕۆڵ)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="VIEWER">بینەر (VIEWER) - تەنها دەتوانێت داتاکان ببینێت</option>
                  <option value="IT_STAFF">کارمەندی ئایتی (IT_STAFF) - دەتوانێت داتا زیاد بکات و دەستکاری بکات</option>
                  <option value="ADMIN">ئەدمین (ADMIN) - هەموو دەسەڵاتێکی هەیە</option>
                </select>
              </div>

              {error && <p className="text-sm font-semibold text-red-500 mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/30">{error}</p>}
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-5">
            <Button variant="ghost" onClick={onClose} disabled={loading} className="font-bold">
              پاشگەزبوونەوە
            </Button>
            <Button 
              type="submit" 
              form="add-user-form" 
              disabled={loading || !name.trim() || !username.trim() || !password.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
            >
              {loading ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردن'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddUserModal;
