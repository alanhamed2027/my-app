import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { LogOut, Menu } from 'lucide-react';

const TopNavbar = ({ toggleSidebar }) => {
  const { logout } = useAuth();
  const { systemType } = useSystem();

  return (
    <header className="fixed top-0 z-30 flex h-20 w-full lg:w-[calc(100%-16rem)] items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-6 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden rounded-full p-2 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:flex relative items-center pr-5">
          {/* Dark Golden Accent Bar */}
          <div className={`absolute right-0 w-1.5 h-8 rounded-full shadow-sm ${
            systemType === 'EXTERNAL' 
              ? 'bg-gradient-to-b from-emerald-500 to-emerald-800' 
              : 'bg-gradient-to-b from-indigo-500 to-indigo-800'
          }`}></div>
          
          <h2 
            className={`text-[36px] font-black bg-clip-text text-transparent drop-shadow-sm tracking-wide ${
              systemType === 'EXTERNAL'
                ? 'bg-gradient-to-b from-emerald-600 to-emerald-900'
                : 'bg-gradient-to-b from-indigo-600 to-indigo-900'
            }`}
            style={{ fontFamily: "'Uni Kurd', 'Noto Naskh Arabic', sans-serif", lineHeight: '1.2' }}
          >
            {systemType === 'EXTERNAL' ? 'شارەوانییەکانى سەر بە بەرێوەبەرایەتى گشتى' : 'بەڕێوەبەرایەتى گشتى شارەوانییەکان'}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications removed as per user request */}

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:hover:bg-red-900/40 hover:shadow-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">چوونەدەرەوە</span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
