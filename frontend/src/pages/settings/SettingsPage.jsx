import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, 
  User, 
  MonitorSmartphone, 
  Database,
  Building2
} from 'lucide-react';
import clsx from 'clsx';

// Components for tabs
import ProfileSettings from './tabs/ProfileSettings';
import CategorySettings from './tabs/CategorySettings';
import OrgSettings from './tabs/OrgSettings';
import SystemSettings from './tabs/SystemSettings';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'هەژماری من', icon: User },
    { id: 'categories', label: 'جۆرەکانی ئامێر', icon: MonitorSmartphone },
    { id: 'organization', label: 'زانیاری فەرمانگە', icon: Building2 },
    { id: 'system', label: 'سیستەم و داتابەیس', icon: Database },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950 text-white shadow-lg shadow-slate-900/20">
          <Settings size={28} className="animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">ڕێکخستنەکان</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base mt-1">
            کۆنتڕۆڵکردنی هەژمارەکەت و ڕێکخستنە گشتییەکانی سیستەم
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-slate-50 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-3 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold whitespace-nowrap",
                    isActive 
                      ? "bg-slate-800 text-white shadow-md dark:bg-slate-100 dark:text-slate-900" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Icon size={20} className={isActive ? "animate-pulse" : ""} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 min-h-[500px] relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'profile' && <ProfileSettings />}
                  {activeTab === 'categories' && <CategorySettings />}
                  {activeTab === 'organization' && <OrgSettings />}
                  {activeTab === 'system' && <SystemSettings />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
