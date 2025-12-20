import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

const ComboInput = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select or type...', 
  icon: Icon,
  name 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange({ target: { name, value: newValue } });
  };

  const handleOptionClick = (optionValue) => {
    setInputValue(optionValue);
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const filteredOptions = inputValue.trim() === '' 
    ? options 
    : options.filter(opt => 
        (opt.name || opt).toLowerCase().includes(inputValue.toLowerCase())
      );

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`input-field ${Icon ? 'pl-10' : ''} pr-10`}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => {
              const optValue = opt.name || opt;
              return (
                <button
                  key={opt.id || index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOptionClick(optValue);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                    optValue === inputValue ? 'bg-primary-50 text-primary-600' : ''
                  }`}
                >
                  {optValue}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">No matches found. Type to add custom.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComboInput;
