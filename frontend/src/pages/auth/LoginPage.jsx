import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="flex flex-col-reverse md:flex-row-reverse w-full max-w-[1000px] bg-white shadow-2xl overflow-hidden rounded-lg">
        
        {/* Image Side (With row-reverse in RTL, this appears on the LEFT) */}
        <div className="hidden md:block md:w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1566888596782-c7f41cc184c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=2134&q=80" 
            alt="Login Background" 
            className="object-cover w-full h-full min-h-full" 
          />
        </div>

        {/* Form Side (In RTL, placing this second makes it appear on the RIGHT) */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          
          {/* Header Section */}
          <div className="mb-10 text-center flex flex-col items-center border-b border-slate-100 pb-6">
            <h2 
              className="text-2xl font-bold text-slate-900 mb-3 leading-tight"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              بەرێوەبەرایەتى گشتى شارەوانیەکان
            </h2>
            <h3 
              className="text-xl font-bold text-slate-500 mb-5"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              بەشى تەکنەلۆجیاى زانیارى
            </h3>
            <div 
              className="inline-block bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-md"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              سیستەمى تۆمارى ئامێرى ئەلکترۆنى
            </div>
          </div>
          
          <div className="w-full">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 rounded bg-red-100 p-3 text-sm font-semibold text-red-700 text-center">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="ناوی بەکارهێنەر (Username)" 
                  className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors text-left" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  dir="ltr"
                  required
                />
              </div>

              <div className="mb-4">
                <input 
                  type="password" 
                  placeholder="وشەی نهێنی (Password)" 
                  className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors text-left"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  required
                />
              </div>

              <div className="pb-4">
                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-lg"
                  disabled={isLoading}
                  style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  ) : "چوونەژوورەوە"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
