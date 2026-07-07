import React, { useState, useEffect } from 'react';
import axios from '../../../services/axios';
import Button from '../../../components/ui/Button';
import { MonitorSmartphone, Plus, Trash2, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const CategorySettings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/devices/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    setSubmitLoading(true);
    try {
      const res = await axios.post('/devices/categories', newCategory);
      if (res.data.success) {
        setNewCategory({ name: '', description: '' });
        setIsAdding(false);
        fetchCategories(); // Refresh list
      }
    } catch (error) {
      alert(error.response?.data?.error || 'هەڵەیەک ڕوویدا لە زیادکردن');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`دڵنیایت لە سڕینەوەی جۆری "${name}"؟\nئەم کردارە تەنها ئەوکاتە دەکرێت ئەگەر ئامێرێک لەم جۆرە نەبێت.`)) {
      return;
    }

    try {
      const res = await axios.delete(`/devices/categories/${id}`);
      if (res.data.success) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (error) {
      alert(error.response?.data?.error || 'هەڵەیەک ڕوویدا لە سڕینەوە. لەوانەیە ئامێر بەستراوەتەوە بەم جۆرەوە.');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MonitorSmartphone className="text-emerald-500" />
            جۆرەکانی ئامێر
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            زیادکردن و سڕینەوەی جۆرەکانی ئامێر کە لە سیستەمەکەدا بەکاردێن.
          </p>
        </div>
        
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus size={18} />
            جۆری نوێ
          </Button>
        )}
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-6 mb-8"
          onSubmit={handleAddCategory}
        >
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">زیادکردنی جۆری نوێ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ناوی جۆر (Category Name)</label>
              <input 
                type="text" 
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="بۆ نموونە: کۆمپیوتەر"
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">تێبینی (ئارەزوومەندانە)</label>
              <input 
                type="text" 
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                placeholder="زانیاری زیاتر..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={submitLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl"
            >
              پاشەکەوتکردن
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsAdding(false)}
              className="text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              پاشگەزبوونەوە
            </Button>
          </div>
        </motion.form>
      )}

      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
            <ShieldAlert size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
            <p className="font-bold">هیچ جۆرێک تۆمار نەکراوە</p>
          </div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-4 px-6 w-16">#</th>
                <th className="py-4 px-6">ناوی جۆر</th>
                <th className="py-4 px-6">تێبینی</th>
                <th className="py-4 px-6 text-center w-32">کردارەکان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {categories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">{index + 1}</td>
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">{cat.name}</td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{cat.description || '-'}</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl w-8 h-8"
                        title="سڕینەوە"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategorySettings;
