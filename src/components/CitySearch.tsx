
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { useCities } from '@/hooks/useCities';

interface CitySearchProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
}

const CitySearch: React.FC<CitySearchProps> = ({
  value,
  onChange,
  placeholder = "Начните вводить город...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: cities = [] } = useCities();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = cities
        .filter(city => 
          city.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map(city => city.name)
        .slice(0, 10);
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
    }
  }, [inputValue, cities]);

  const selectCity = (city: string) => {
    onChange(city);
    setInputValue(city);
    setShowSuggestions(false);
  };

  const clearCity = () => {
    onChange('');
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        onChange(inputValue.trim());
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        {value && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {value}
              <button
                type="button"
                onClick={clearCity}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </Badge>
          </div>
        )}
        
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          onFocus={() => inputValue && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
      </div>

      {showSuggestions && filteredCities.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => selectCity(city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
