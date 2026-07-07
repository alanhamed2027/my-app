import React, { useState, useRef } from 'react';
import { Database, DownloadCloud, UploadCloud, Monitor } from 'lucide-react';
import Button from '../../../components/ui/Button';
import axios from '../../../services/axios';

const SystemSettings = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      // In Axios, to download a file, we need responseType: 'blob'
      const response = await axios.get('/backup/export', { responseType: 'blob' });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from header if possible, or use default
      let fileName = 'backup.sql';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches != null && matches[1]) fileName = matches[1];
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'کۆپی یەدەگ بە سەرکەوتوویی داگیرا.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'هەڵەیەک ڕوویدا لە کاتی وەرگرتنی کۆپی یەدەگ. دڵنیابە XAMPP بە دروستی کاردەکات.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreClick = () => {
    if (window.confirm('ئاگاداری: گەڕاندنەوەی زانیارییەکان دەبێتە هۆی سڕینەوەی تەواوی زانیارییەکانی ئێستا و دانانی زانیارییە کۆنەکان. دڵنیایت؟')) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.sql')) {
      setMessage({ type: 'error', text: 'تکایە تەنها فایلی جۆری SQL هەڵبژێرە.' });
      return;
    }

    setIsRestoring(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('backupFile', file);

    try {
      const res = await axios.post('/backup/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'داتابەیس بە سەرکەوتوویی گەڕێندرایەوە. تکایە سیستەمەکە ڕیفرێش بکەرەوە.' });
        // Clear input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'هەڵەیەک ڕوویدا لە کاتی گەڕاندنەوەی زانیارییەکان.' });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Database className="text-purple-500" />
          سیستەم و داتابەیس
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          لێرەوە دەتوانیت کۆپی یەدەگ لە زانیارییەکانت بگریت یان زانیارییەکان بگەڕێنیتەوە.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 font-bold text-sm border ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Backup Card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <DownloadCloud size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">وەرگرتنی کۆپی (Backup)</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">
              دابەزاندنی تەواوی داتابەیسەکە بە شێوەی پەڕگەیەک بۆ پاراستنی زانیارییەکان.
            </p>
            <Button 
              onClick={handleExport}
              disabled={isExporting || isRestoring}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <DownloadCloud size={18} />
              )}
              {isExporting ? 'چاوەڕێ بە...' : 'کۆپی یەدەگ دابەزێنە'}
            </Button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
              <UploadCloud size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">گەڕاندنەوە (Restore)</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">
              گەڕاندنەوەی ئەو زانیارییانەی پێشتر کۆپیت کردوون لە کاتی بوونی کێشەدا.
            </p>
            
            <input 
              type="file" 
              accept=".sql" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
            />
            
            <Button 
              onClick={handleRestoreClick}
              disabled={isExporting || isRestoring}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              {isRestoring ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <UploadCloud size={18} />
              )}
              {isRestoring ? 'چاوەڕێ بە...' : 'گەڕاندنەوەی زانیاری'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
