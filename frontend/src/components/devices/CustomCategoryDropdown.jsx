import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../services/axios';

const CustomCategoryDropdown = ({ categories, value, onChange, onCategoryAdded, onCategoryDeleted, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCategory = async () => {
    if (!inputValue.trim()) return;

    // Check if it already exists locally
    const existing = categories.find(c => c.name.toLowerCase() === inputValue.trim().toLowerCase());
    if (existing) {
      onChange(existing.id);
      setIsOpen(false);
      setInputValue('');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/devices/categories', { name: inputValue.trim() });
      if (res.data.success) {
        const newCategory = res.data.data;
        if (onCategoryAdded) onCategoryAdded(newCategory);
        onChange(newCategory.id);
        setIsOpen(false);
        setInputValue('');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (e, categoryId) => {
    e.stopPropagation();
    if (!window.confirm('دڵنیایت لە سڕینەوەی ئەم جۆرە؟')) return;

    try {
      const res = await axios.delete(`/devices/categories/${categoryId}`);
      if (res.data.success) {
        if (onCategoryDeleted) onCategoryDeleted(categoryId);
        if (value === categoryId) onChange('');
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'هەڵەیەک ڕوویدا لە کاتی سڕینەوەی جۆرەکە';
      alert(msg);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Get the name of the currently selected category
  const selectedCategoryName = categories.find(c => String(c.id) === String(value))?.name;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-900 px-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer py-2 transition-colors shadow-sm hover:border-primary-300 dark:hover:border-primary-600"
      >
        <span className={`text-xs truncate flex-1 text-center ${selectedCategoryName ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400'}`} dir="ltr">
          {selectedCategoryName || placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Search / Add Input */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="گەڕان یان زیادکردن..."
                className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100"
                dir="auto"
              />
              {inputValue.trim() && !categories.find(c => c.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
                <button 
                  onClick={handleAddCategory}
                  disabled={loading}
                  className="p-1.5 flex-shrink-0 bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 hover:bg-primary-200 rounded-lg transition-colors disabled:opacity-50"
                  title="زیادکردن"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Plus size={14} />
                  )}
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-40 overflow-y-auto p-1">
              {filteredCategories.length === 0 ? (
                <div className="text-xs text-center text-slate-400 py-3">هیچ ئەنجامێک نییە</div>
              ) : (
                filteredCategories.map((cat) => (
                  <div 
                    key={cat.id}
                    onClick={() => {
                      onChange(cat.id);
                      setIsOpen(false);
                      setInputValue('');
                    }}
                    className={`group flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${String(value) === String(cat.id) ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    dir="ltr"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {String(value) === String(cat.id) && <Check size={12} className="text-primary-600 flex-shrink-0" />}
                      <span className="truncate">{cat.name}</span>
                    </div>

                    <button 
                      onClick={(e) => handleDeleteCategory(e, cat.id)}
                      className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="سڕینەوە"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomCategoryDropdown;
