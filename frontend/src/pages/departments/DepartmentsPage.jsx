import { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Building2, Plus, Trash2, Edit } from 'lucide-react';
import AddDepartmentModal from '../../components/departments/AddDepartmentModal';
import EditDepartmentModal from '../../components/departments/EditDepartmentModal';
import { useSystem } from '../../context/SystemContext';

const DepartmentsPage = () => {
  const { user } = useAuth();
  const { systemType } = useSystem();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState(null);

  const handleDelete = async (id, name) => {
    if (window.confirm(`دڵنیایت لە سڕینەوەی بەشی "${name}" و هەموو ژوورەکانی ناوی؟ ئەم کارە هەڵناوەشێتەوە.`)) {
      try {
        const response = await axios.delete(`/departments/${id}`);
        if (response.data.success) {
          setDepartments(departments.filter(d => d.id !== id));
        }
      } catch (error) {
        alert('هەڵەیەک ڕوویدا لە کاتی سڕینەوە');
      }
    }
  };

  const handleEdit = (dept) => {
    setSelectedDeptForEdit(dept);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/departments');
        if (response.data.success) {
          setDepartments(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch departments', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header section with gradient background */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-800/10 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-tr from-purple-100 to-primary-50 dark:from-purple-900/20 dark:to-primary-800/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400">
                <Building2 size={24} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                {systemType === 'EXTERNAL' ? 'شارەوانییەکان' : 'بەشەکانی بەڕێوەبەرایەتی گشتی'}
              </h2>
            </div>
            {systemType === 'EXTERNAL' && (
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base mt-1">
                تەواوی شارەوانییەکانی دەرەوە لێرە بەڕێوەبەرە.
              </p>
            )}
          </div>
          
          <div className="flex w-full md:w-auto items-center relative z-10">
            {(user?.role === 'ADMIN' || user?.role === 'IT_STAFF') && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-white font-bold hover:bg-primary-700 shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-1 w-full sm:w-auto"
              >
                <Plus size={20} />
                <span>{systemType === 'EXTERNAL' ? 'زیادکردنی شارەوانی' : 'زیادکردنی بەش'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Grid of Departments */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start">
        {departments.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Building2 size={32} />
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-slate-100">
              {systemType === 'EXTERNAL' ? 'هیچ شارەوانییەک نییە' : 'هیچ بەشێک نییە'}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {systemType === 'EXTERNAL' ? 'شارەوانییەکی نوێ تۆمار بکە بۆ بینینی لێرە.' : 'بەشێکی نوێ تۆمار بکە بۆ بینینی لێرە.'}
            </p>
          </div>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-all hover:shadow-xl hover:ring-primary-200 dark:hover:ring-primary-800/50 hover:-translate-y-1">
              <div className="absolute right-0 top-0 h-full w-1.5 bg-primary-500 rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-transform group-hover:scale-110">
                  <Building2 size={20} />
                </div>
                {(['ADMIN', 'IT_STAFF'].includes(user?.role?.toUpperCase())) && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(dept)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    {user?.role?.toUpperCase() === 'ADMIN' && (
                      <button 
                        onClick={() => handleDelete(dept.id, dept.name)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1 line-clamp-2" title={dept.name}>{dept.name}</h3>
                <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>{dept.rooms?.length || 0} ژوور هەیە</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddDepartmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={(newDept) => {
          setDepartments(prev => [...prev, newDept]);
        }}
      />

      <EditDepartmentModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDeptForEdit(null);
        }}
        department={selectedDeptForEdit}
        onUpdated={(updatedDept) => {
          setDepartments(departments.map(d => d.id === updatedDept.id ? updatedDept : d));
        }}
      />
    </div>
  );
};

export default DepartmentsPage;
