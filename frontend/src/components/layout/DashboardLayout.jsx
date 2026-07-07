import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 print:bg-white print:min-h-0">
      {/* Sidebar */}
      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col transition-all duration-300 lg:ms-64 min-w-0 min-h-screen print:ms-0 print:min-h-0">
        <div className="print:hidden">
          <TopNavbar toggleSidebar={() => setIsSidebarOpen(true)} />
        </div>
        
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden pt-24 lg:pt-28 print:p-0 print:pt-0 print:overflow-visible">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out print:max-w-none print:w-full print:animate-none">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
