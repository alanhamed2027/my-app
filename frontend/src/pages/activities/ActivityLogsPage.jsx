import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { 
  Activity, Search, Filter, Calendar, 
  ChevronRight, ChevronLeft, User, Server, AlertCircle 
} from 'lucide-react';
import Button from '../../components/ui/Button';

const translateEntity = (entity) => {
  if (!entity) return '-';
  const map = {
    'DEVICE': 'ئامێرەکان',
    'USER': 'بەکارهێنەران',
    'DEPARTMENT': 'بەشەکان',
    'ROOM': 'ژوورەکان',
    'MAINTENANCE': 'چاککردنەوە',
    'LOGIN': 'چوونەژوورەوە',
    'CATEGORY': 'جۆرەکانی ئامێر',
    'AUTH': 'دەسەڵاتەکان',
    'SETTING': 'ڕێکخستنەکان'
  };
  return map[entity.toUpperCase()] || entity;
};

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 15;

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get('/activities', {
        params: {
          page: currentPage,
          limit,
          action: actionFilter || undefined,
          entity: entityFilter || undefined
        }
      });
      setLogs(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setTotalItems(res.data.meta.totalItems);
    } catch (err) {
      console.error(err);
      setError('نەتوانرا چالاکییەکان بهێنرێت. تکایە دووبارە هەوڵبدەرەوە.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, entityFilter]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getActionBadge = (action) => {
    switch(action) {
      case 'CREATE': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">زیادکردن</span>;
      case 'UPDATE': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">گۆڕانکاری</span>;
      case 'DELETE': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">سڕینەوە</span>;
      case 'LOGIN': return <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-md">چوونەژوورەوە</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">تۆماری چالاکییەکان</h1>
            <p className="text-sm text-slate-500 font-medium">چاودێریکردنی سەرجەم جووڵەکانی سیستەم</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">فلتەرکردن:</span>
        </div>
        
        <select 
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500 font-medium"
        >
          <option value="">هەموو جۆرە کردارەکان</option>
          <option value="CREATE">زیادکردن (CREATE)</option>
          <option value="UPDATE">گۆڕانکاری (UPDATE)</option>
          <option value="DELETE">سڕینەوە (DELETE)</option>
          <option value="LOGIN">چوونەژوورەوە (LOGIN)</option>
        </select>

        <select 
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500 font-medium"
        >
          <option value="">هەموو بەشەکان</option>
          <option value="DEVICE">ئامێرەکان</option>
          <option value="USER">بەکارهێنەران</option>
          <option value="MAINTENANCE">چاککردنەوە</option>
          <option value="DEPARTMENT">بەشەکان</option>
          <option value="ROOM">ژوورەکان</option>
        </select>

        <Button 
          variant="outline" 
          className="ms-auto font-bold"
          onClick={() => {
            setActionFilter('');
            setEntityFilter('');
            setCurrentPage(1);
          }}
        >
          پاککردنەوە
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-2 font-bold">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">کات و بەروار</th>
                <th className="px-6 py-4 font-bold">بەکارهێنەر</th>
                <th className="px-6 py-4 font-bold">کردار</th>
                <th className="px-6 py-4 font-bold">بەش</th>
                <th className="px-6 py-4 font-bold w-[40%]">وردەکاری</th>
                <th className="px-6 py-4 font-bold text-center">سیستەم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-bold">لە هێنانەوەدایە...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-bold">
                    هیچ چالاکییەک نەدۆزرایەوە
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        <span dir="ltr">{new Date(log.createdAt).toLocaleString('en-GB')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs">
                            <User size={12} />
                          </div>
                          <span>{log.user.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">سڕاوەتەوە</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">
                      {translateEntity(log.entity)} {log.entityId ? `(#${log.entityId})` : ''}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {log.details || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100" title={`IP: ${log.ipAddress || 'Unknown'}`}>
                        <Server size={12} />
                        {log.ipAddress === '::1' ? 'Localhost' : (log.ipAddress || 'N/A')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
            <span className="text-sm text-slate-500 font-medium">
              کۆی گشتی {totalItems} تۆمار
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2"
              >
                <ChevronRight size={16} />
              </Button>
              
              <div className="text-sm font-bold text-slate-700 px-4">
                پەڕەی {currentPage} لە {totalPages}
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2"
              >
                <ChevronLeft size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ActivityLogsPage;
