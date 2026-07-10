import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { 
  LayoutDashboard, 
  Monitor, 
  Building2, 
  Wrench, 
  Users, 
  FileText, 
  Settings,
  X,
  LayoutGrid,
  Activity,
  ArrowRightLeft
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const { systemType } = useSystem();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'داشبۆرد', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'IT_STAFF', 'VIEWER'] },
    { name: 'ئامێرەکان', path: '/devices', icon: <Monitor size={20} />, roles: ['ADMIN', 'IT_STAFF', 'VIEWER'] },
    { name: systemType === 'EXTERNAL' ? 'شارەوانییەکان' : 'بەشەکان', path: '/departments', icon: <Building2 size={20} />, roles: ['ADMIN', 'IT_STAFF', 'VIEWER'] },
    { name: 'چاککردنەوە', path: '/maintenance', icon: <Wrench size={20} />, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'ڕاپۆرتەکان', path: '/reports', icon: <FileText size={20} />, roles: ['ADMIN', 'IT_STAFF'] },
    { name: 'بەکارهێنەران', path: '/users', icon: <Users size={20} />, roles: ['ADMIN'] },
    { name: 'تۆماری چالاکییەکان', path: '/activities', icon: <Activity size={20} />, roles: ['ADMIN'] },
    { name: 'ڕێکخستنەکان', path: '/settings', icon: <Settings size={20} />, roles: ['ADMIN'] },
  ];

  return (
    <aside 
      className={clsx(
        "fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl lg:shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4">
        <div className="flex flex-1 items-center justify-center py-2">
          <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60 px-4 sm:px-6 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 drop-shadow-sm" style={{ letterSpacing: '0.1em' }}>
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              {time.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden rounded-full p-2 hover:bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="flex flex-col gap-2 px-4">
          {navItems.map((item) => {
            if (!item.roles.includes(user?.role)) return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                  isActive 
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20 translate-x-1' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1'
                )}
              >
                {item.icon}
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={() => {
            setIsOpen(false);
            navigate('/portal');
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-sm font-bold text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors shadow-sm mb-4 border border-primary-100 dark:border-primary-800"
        >
          <ArrowRightLeft size={18} />
          گۆڕینی سیستەم
        </button>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{user?.name}</span>
              <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
