import React, { useState } from 'react';
import axios from '../../../services/axios';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import { User, Lock, Mail, Save } from 'lucide-react';
import clsx from 'clsx';

const ProfileSettings = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'وشەی نهێنی و دووپاتکردنەوەکەی وەک یەک نین!' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        username: formData.username
      };
      
      if (formData.password) {
        payload.password = formData.password;
      }

      // Send PUT request to update user
      const res = await axios.put(`/users/${user.id}`, payload);
      
      if (res.data.success) {
        setMessage({ type: 'success', text: 'زانیارییەکانت بە سەرکەوتوویی نوێکرانەوە! لەوانەیە پێویست بکات دووبارە بچیتە ژوورەوە.' });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی نوێکردنەوە' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <User className="text-primary-500" />
          زانیارییەکانی هەژمار
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          لێرەوە دەتوانیت ناو، یوزەرنەیم و پاسۆردی خۆت بگۆڕیت.
        </p>
      </div>

      {message && (
        <div className={clsx(
          "p-4 rounded-xl mb-6 font-bold text-sm border",
          message.type === 'success' 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" 
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        )}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ناوی تەواو</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 px-10 py-3 text-sm font-medium outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">یوزەرنەیم</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 px-10 py-3 text-sm font-medium outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white transition-all"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />
        
        <div>
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Lock size={16} className="text-slate-400" />
            گۆڕینی وشەی نهێنی (Password)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">ئەگەر ناتەوێت پاسۆردەکەت بگۆڕیت، ئەم دوو خانەیە بە بەتاڵی جێبهێڵە.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">پاسۆردی نوێ</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 px-4 py-3 text-sm font-medium outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white transition-all"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">دووپاتکردنەوەی پاسۆرد</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 px-4 py-3 text-sm font-medium outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white transition-all"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={18} />
            )}
            پاشەکەوتکردنی گۆڕانکارییەکان
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
