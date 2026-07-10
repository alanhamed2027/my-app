import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useSystem } from '../../context/SystemContext';
import { 
  Monitor, 
  Users, 
  Building2, 
  AlertTriangle,
  Activity,
  Wrench,
  Clock,
  CheckCircle2,
  Cpu,
  Printer,
  Copy,
  Laptop,
  CheckSquare,
  Scan,
  Fingerprint
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PhotocopierIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 10h12v12H6z" />
    <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M8 10V8h8v2" />
    <path d="M6 14h12" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const StatCard = ({ title, value, icon, description, colorTheme }) => (
  <div className={clsx(
    "group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1",
    colorTheme.borderRight
  )}>
    <div className="relative z-10 flex flex-row items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">{title}</h3>
      <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110", colorTheme.iconBg, colorTheme.iconText)}>
        {icon}
      </div>
    </div>
    <div className="relative z-10">
      <div className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
        {Number(value || 0).toLocaleString()}
      </div>
      {description && <p className="mt-2 text-xs font-bold text-slate-400 dark:text-slate-500">{description}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 p-3 rounded-xl shadow-xl">
        <p className="text-white font-bold text-sm mb-1">{payload[0].name}</p>
        <p className="text-primary-400 font-black text-lg">{payload[0].value} ئامێر</p>
      </div>
    );
  }
  return null;
};

let cachedStats = null;

const DashboardPage = () => {
  const { systemType } = useSystem();
  const [stats, setStats] = useState(cachedStats);
  const [loading, setLoading] = useState(!cachedStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/dashboard');
        if (response.data.success) {
          cachedStats = response.data.data;
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Simulate real-time updates by refetching every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="relative flex flex-col items-center gap-6">
          <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full h-32 w-32 animate-pulse"></div>
          <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500"></div>
          <p className="relative font-bold text-primary-500 animate-pulse text-lg">ئامادەکردنی داتاکان...</p>
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-center font-bold text-red-500 mt-10">هەڵەیەک ڕوویدا لە هێنانی داتاکان.</p>;

  // Colors for Pie Chart
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  const getCategoryColor = (name, index) => {
    if (!name) return COLORS[index % COLORS.length];
    const n = name.toLowerCase();
    if (n.includes('کۆمپیوتەر') || n.includes('computer') || n.includes('لاپتۆپ')) return '#0ea5e9'; // sky-500
    if (n.includes('پرینتەر') || n.includes('printer')) return '#8b5cf6'; // violet-500
    if (n.includes('سکانەر') || n.includes('scanner')) return '#ec4899'; // pink-500
    if (n.includes('ئیستنساخ') || n.includes('photocopier')) return '#14b8a6'; // teal-500
    if (n.includes('پەنجەمۆر') || n.includes('fingerprint') || n.includes('بەسەمە')) return '#f97316'; // orange-500
    return COLORS[index % COLORS.length];
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-orange-50/60 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-200/60 dark:border-orange-800/30 backdrop-blur-xl shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-orange-900 dark:text-orange-100 leading-tight">
            {systemType === 'EXTERNAL' ? 'داشبۆردی شارەوانییەکان' : 'پوختەى ئامارەکانى ئامێرى ئەلکترۆنى'}
          </h2>
          {systemType === 'EXTERNAL' ? (
            <p className="mt-2 text-orange-700/80 dark:text-orange-300/80 font-medium">
              پوختەى ئامارەکانى ئامێرى ئەلکترۆنى سەرجەم شارەوانییەکان
            </p>
          ) : (
            <p className="mt-2 text-orange-700/80 dark:text-orange-300/80 font-medium">
              سەرجەم بەشەکانى ناو دیوانى بەرێوەبەرایەتى گشتى
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-5 py-3 shadow-inner">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm tracking-wide">سیستەم چالاکە (Live)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard 
          title="کۆی گشتی ئامێرەکان" 
          value={stats.totals.devices} 
          icon={<Monitor size={24} />} 
          description="ئامێری تۆمارکراو لە سیستەم"
          colorTheme={{ borderRight: 'border-r-4 border-r-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconText: 'text-emerald-600 dark:text-emerald-400' }}
        />
        <StatCard 
          title="کۆی گشتی کۆمپیوتەر" 
          value={stats.devicesByCategory.find(c => c.name.includes('کۆمپیوتەر') || c.name.toLowerCase().includes('computer') || c.name.toLowerCase().includes('لاپتۆپ'))?.count || 0} 
          icon={<Laptop size={24} />} 
          description="کۆی لاپتۆپ و دیسکتۆپ"
          colorTheme={{ borderRight: 'border-r-4 border-r-sky-500', iconBg: 'bg-sky-50 dark:bg-sky-500/10', iconText: 'text-sky-600 dark:text-sky-400' }}
        />
        <StatCard 
          title="کۆی گشتی پرینتەر" 
          value={stats.devicesByCategory.find(c => c.name.includes('پرینتەر') || c.name.toLowerCase().includes('printer'))?.count || 0} 
          icon={<Printer size={24} />} 
          description="کۆی پرینتەرەکان"
          colorTheme={{ borderRight: 'border-r-4 border-r-violet-500', iconBg: 'bg-violet-50 dark:bg-violet-500/10', iconText: 'text-violet-600 dark:text-violet-400' }}
        />
        <StatCard 
          title="کۆی گشتی سکانەر" 
          value={stats.devicesByCategory.find(c => c.name.includes('سکانەر') || c.name.toLowerCase().includes('scanner'))?.count || 0} 
          icon={<Scan size={24} />} 
          description="کۆی ئامێرەکانی سکانەر"
          colorTheme={{ borderRight: 'border-r-4 border-r-pink-500', iconBg: 'bg-pink-50 dark:bg-pink-500/10', iconText: 'text-pink-600 dark:text-pink-400' }}
        />
        <StatCard 
          title="کۆی گشتی ئیستنساخ" 
          value={stats.devicesByCategory.find(c => c.name.includes('ئیستنساخ') || c.name.toLowerCase().includes('photocopier'))?.count || 0} 
          icon={<PhotocopierIcon size={24} />} 
          description="کۆی ئامێرەکانی ئیستنساخ"
          colorTheme={{ borderRight: 'border-r-4 border-r-teal-500', iconBg: 'bg-teal-50 dark:bg-teal-500/10', iconText: 'text-teal-600 dark:text-teal-400' }}
        />
        <StatCard 
          title="کۆی گشتی پەنجەمۆر" 
          value={stats.devicesByCategory.find(c => c.name.includes('پەنجەمۆر') || c.name.toLowerCase().includes('fingerprint') || c.name.includes('بەسەمە'))?.count || 0} 
          icon={<Fingerprint size={24} />} 
          description="کۆی ئامێرەکانی پەنجەمۆر"
          colorTheme={{ borderRight: 'border-r-4 border-r-orange-500', iconBg: 'bg-orange-50 dark:bg-orange-500/10', iconText: 'text-orange-600 dark:text-orange-400' }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Live Feed: Recent Maintenance */}
        <div className="col-span-1 lg:col-span-4 flex flex-col rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-[500px]">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">دوایین چاککردنەوەکان</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ڕاپۆرتی ڕاستەوخۆی کۆتا ٥ ئامێری چاککراوە</p>
              </div>
            </div>
            <div className="flex -space-x-2 space-x-reverse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <Wrench size={12} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-4">
              {stats.recentMaintenance?.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400 opacity-50 pt-20">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                  <p className="font-bold">هیچ کێشەیەک بوونی نییە لە ئێستادا</p>
                </div>
              ) : (
                stats.recentMaintenance?.map((log, index) => (
                  <div 
                    key={log.id} 
                    className="group relative flex items-start gap-4 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-800 p-5 transition-all duration-300 border border-transparent hover:border-slate-200 dark:border-slate-700 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 bottom-0 right-8 w-[2px] bg-slate-200 dark:bg-slate-700 -z-10 hidden sm:block"></div>
                    
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 shadow-sm group-hover:scale-110 transition-transform duration-300 z-10">
                      <Cpu size={22} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-base font-black text-slate-800 dark:text-slate-100">
                          {log.maintenanceTask || 'چاککردنەوەی نەزانراو'}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-900/50 px-3 py-1.5 rounded-full w-fit">
                          <Clock size={12} />
                          {new Date(log.visitDate).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        داواکار: {log.requesterName || 'نەزانراو'} - لەلایەن فەرمانبەری تەکنیکی ئایتی: {log.technician?.name || 'نەزانراو'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Donut Chart: Devices By Category */}
        <div className="col-span-1 lg:col-span-3 flex flex-col rounded-3xl bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[500px]">
          <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <Monitor size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">ئامێرەکان بەپێی جۆر</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ڕێژەی جۆرە جیاوازەکان</p>
            </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-center relative">
            {stats.devicesByCategory?.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 opacity-50">
                <p className="font-bold">هیچ داتایەک نییە.</p>
              </div>
            ) : (
              <div className="h-full w-full absolute inset-0 pb-6 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={stats.devicesByCategory}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="count"
                      stroke="none"
                      animationBegin={200}
                      animationDuration={1500}
                    >
                      {stats.devicesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-bold ml-2">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '-25px' }}>
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                    {Number(stats.totals.devices || 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-400">کۆی گشتی</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;

