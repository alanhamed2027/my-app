import React, { useState, useRef, useEffect } from 'react';
import { Building2, Upload, AlertCircle, Save, Image as ImageIcon } from 'lucide-react';
import Button from '../../../components/ui/Button';
import axios from '../../../services/axios';
import { useSettings } from '../../../context/SettingsContext';

const OrgSettings = () => {
  const { settings, updateLocalSettings } = useSettings();
  const [orgName, setOrgName] = useState('');
  const [orgLogo, setOrgLogo] = useState(null); // base64 string
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (settings) {
      setOrgName(settings.orgName || '');
      setOrgLogo(settings.orgLogo || null);
    }
  }, [settings]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'قەبارەی وێنەکە نابێت لە 2 مێگابایت زیاتر بێت.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgLogo(reader.result); // Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setOrgLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.put('/settings', { orgName, orgLogo });
      if (res.data.success) {
        updateLocalSettings(res.data.data);
        setMessage({ type: 'success', text: 'بە سەرکەوتوویی پاشەکەوت کرا.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'هەڵەیەک ڕوویدا لە کاتی پاشەکەوتکردن.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Building2 className="text-blue-500" />
          زانیاری فەرمانگە
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          ناوی فەرمانگە و لۆگۆکەی دیاری بکە بۆ ئەوەی ڕاستەوخۆ لەسەر وەرەقەی چاپی A4 دەربکەوێت.
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

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ناوی فەرمانگە</label>
          <input 
            type="text" 
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white transition-all"
            placeholder="بۆ نموونە: بەڕێوەبەرایەتی گشتی تەندروستی"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">لۆگۆی فەرمانگە</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 overflow-hidden relative group">
              {orgLogo ? (
                <>
                  <img src={orgLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={handleRemoveImage} className="text-white bg-red-500 rounded-full p-2 hover:bg-red-600">
                      لابردن
                    </button>
                  </div>
                </>
              ) : (
                <ImageIcon size={40} className="text-slate-300 dark:text-slate-600" />
              )}
            </div>
            
            <div className="flex-1">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <Button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                <Upload size={18} />
                هەڵبژاردنی وێنە
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                فۆرماتە ڕێگەپێدراوەکان: JPG, PNG, WEBP.<br/> 
                قەبارە: کەمتر لە 2MB. 
                <br/>باشترین قەبارە وێنەی چوارگۆشەیە.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={18} />
            )}
            پاشەکەوتکردن
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrgSettings;
