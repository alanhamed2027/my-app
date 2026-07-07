import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystem } from '../../context/SystemContext';
import { Building2, Globe } from 'lucide-react';

const PortalPage = () => {
  const navigate = useNavigate();
  const { switchSystem } = useSystem();

  const handleSelectSystem = (type) => {
    switchSystem(type);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-indigo-500/10 z-0"></div>

      <div className="max-w-5xl w-full px-6 py-12 z-10">
        <div className="text-center mb-16">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6"
            style={{ fontFamily: "'Uni Kurd', 'Noto Naskh Arabic', sans-serif" }}
          >
            بەڕێوەبەرایەتى گشتى شارەوانییەکان
          </h1>
          <p className="text-lg font-medium text-gray-500">تکایە ئەو سیستەمە هەڵبژێرە کە دەتەوێت کاری تێدا بکەیت</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Internal System Card */}
          <button 
            onClick={() => handleSelectSystem('INTERNAL')}
            className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col items-center justify-center min-h-[380px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 group-hover:from-indigo-500/10 group-hover:to-indigo-500/20 transition-all duration-500 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Building2 size={48} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">بەڕێوەبەرایەتی گشتی</h2>
              <p className="text-gray-500 text-center leading-relaxed max-w-md">
                چوونە ژوورەوەى ناو سیستەم تایبەت بە تۆمارى ئامێرى ئەلکترۆنى ناو دیوانى بەرێوەبەرایەتى گشتى شارەوانییەکان
              </p>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </button>

          {/* External System Card */}
          <button 
            onClick={() => handleSelectSystem('EXTERNAL')}
            className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col items-center justify-center min-h-[380px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 group-hover:from-emerald-500/10 group-hover:to-emerald-500/20 transition-all duration-500 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Globe size={48} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">شارەوانییەکانى سەر بە بەرێوەبەرایەتى گشتى</h2>
              <p className="text-gray-500 text-center leading-relaxed max-w-md">
                چوونە ژوورەوەى ناو سیستەم تایبەت بە تۆمارى ئامێرى ئەلکترۆنى ناو شارەوانیەکانى سەر بە بەرێوەبەرایەتى گشتى
              </p>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
