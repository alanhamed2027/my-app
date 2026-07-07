import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultOptions = {
  ram: ['4GB', '8GB', '16GB', '32GB', '64GB'],
  hdd: ['256GB SSD', '512GB SSD', '1TB SSD', '1TB HDD', '2TB HDD'],
  cpu: ['Core i3', 'Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7'],
  gpu: ['Intel Integrated', 'AMD Radeon', 'NVIDIA GTX 1650', 'NVIDIA RTX 3060', 'NVIDIA RTX 4060'],
  brand: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Canon', 'Epson', 'Kyocera', 'Sony', 'Samsung', 'LG']
};

const CustomSpecDropdown = ({ type, value, onChange, placeholder }) => {
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef(null);

  // Load options from localStorage or use defaults
  useEffect(() => {
    const storedOptions = localStorage.getItem(`spec_options_${type}`);
    if (storedOptions) {
      try {
        setOptions(JSON.parse(storedOptions));
      } catch (e) {
        setOptions(defaultOptions[type] || []);
      }
    } else {
      setOptions(defaultOptions[type] || []);
      localStorage.setItem(`spec_options_${type}`, JSON.stringify(defaultOptions[type] || []));
    }
  }, [type]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveOptions = (newOptions) => {
    setOptions(newOptions);
    localStorage.setItem(`spec_options_${type}`, JSON.stringify(newOptions));
  };

  const handleAddOption = () => {
    if (inputValue.trim() && !options.includes(inputValue.trim())) {
      const newOptions = [...options, inputValue.trim()];
      saveOptions(newOptions);
      onChange(inputValue.trim());
      setInputValue('');
      setIsOpen(false);
    }
  };

  const handleDeleteOption = (e, optionToDelete) => {
    e.stopPropagation(); // Prevent selecting the option when clicking delete
    const newOptions = options.filter(opt => opt !== optionToDelete);
    saveOptions(newOptions);
    if (value === optionToDelete) {
      onChange(''); // Clear value if the selected option is deleted
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-900 px-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer py-2 transition-colors shadow-sm hover:border-primary-300 dark:hover:border-primary-600"
      >
        <span className={`text-xs truncate flex-1 text-center ${value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400'}`} dir="ltr">
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Search / Add Input */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                placeholder="گەڕان یان زیادکردن..."
                className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100"
                dir="auto"
              />
              {inputValue.trim() && !options.includes(inputValue.trim()) && (
                <button 
                  onClick={handleAddOption}
                  className="p-1.5 flex-shrink-0 bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 hover:bg-primary-200 rounded-lg transition-colors"
                  title="زیادکردن"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-40 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="text-xs text-center text-slate-400 py-3">هیچ ئەنجامێک نییە</div>
              ) : (
                filteredOptions.map((opt, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setInputValue('');
                    }}
                    className={`group flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${value === opt ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    dir="ltr"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {value === opt && <Check size={12} className="text-primary-600 flex-shrink-0" />}
                      <span className="truncate">{opt}</span>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDeleteOption(e, opt)}
                      className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="سڕینەوە"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSpecDropdown;
