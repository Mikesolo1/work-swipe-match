
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";

interface CitySearchProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
}

// Обширный список городов мира
const WORLD_CITIES = [
  // Россия
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
  'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград', 'Краснодар', 'Саратов', 'Тюмень', 'Тольятти', 'Ижевск', 'Барнаул', 'Ульяновск',
  'Иркутск', 'Хабаровск', 'Ярославль', 'Владивосток', 'Махачкала', 'Томск', 'Оренбург', 'Кемерово', 'Новокузнецк', 'Рязань', 'Пенза',
  'Астрахань', 'Липецк', 'Тула', 'Киров', 'Чебоксары', 'Калининград', 'Курск', 'Улан-Удэ', 'Ставрополь', 'Магнитогорск', 'Сочи',
  
  // Европа
  'Лондон', 'Париж', 'Берлин', 'Мадрид', 'Рим', 'Амстердам', 'Барселона', 'Вена', 'Стокгольм', 'Копенгаген', 'Осло', 'Хельсинки',
  'Прага', 'Будапешт', 'Варшава', 'Бухарест', 'София', 'Афины', 'Лиссабон', 'Дублин', 'Брюссель', 'Цюрих', 'Женева', 'Милан',
  'Неаполь', 'Мюнхен', 'Гамбург', 'Кёльн', 'Франкфурт', 'Дюссельдорф', 'Штутгарт', 'Лейпциг', 'Дрезден', 'Ганновер',
  
  // Северная Америка
  'Нью-Йорк', 'Лос-Анджелес', 'Чикаго', 'Хьюстон', 'Филадельфия', 'Финикс', 'Сан-Антонио', 'Сан-Диего', 'Даллас', 'Сан-Хосе',
  'Остин', 'Джэксонвилл', 'Форт-Уэрт', 'Колумбус', 'Шарлотт', 'Сан-Франциско', 'Индианаполис', 'Сиэтл', 'Денвер', 'Вашингтон',
  'Бостон', 'Эль-Пасо', 'Детройт', 'Нашвилл', 'Портленд', 'Оклахома-Сити', 'Лас-Вегас', 'Луисвилл', 'Балтимор', 'Милуоки',
  'Торонто', 'Монреаль', 'Ванкувер', 'Калгари', 'Эдмонтон', 'Оттава', 'Виннипег', 'Квебек',
  
  // Азия
  'Токио', 'Дели', 'Шанхай', 'Дакка', 'Сан-Паулу', 'Каир', 'Мехико', 'Пекин', 'Мумбаи', 'Осака', 'Карачи', 'Чунцин',
  'Стамбул', 'Буэнос-Айрес', 'Колката', 'Киншаса', 'Лагос', 'Манила', 'Рио-де-Жанейро', 'Тяньцзинь', 'Париж', 'Лондон',
  'Сеул', 'Бангкок', 'Джакарта', 'Ханой', 'Хошимин', 'Куала-Лумпур', 'Сингапур', 'Гонконг', 'Тайбэй', 'Манила',
  'Карачи', 'Лахор', 'Исламабад', 'Ченнаи', 'Бангалор', 'Хайдарабад', 'Ахмадабад', 'Пуна', 'Сурат', 'Канпур',
  
  // Австралия и Океания
  'Сидней', 'Мельбурн', 'Брисбен', 'Перт', 'Аделаида', 'Голд-Кост', 'Канберра', 'Ньюкасл', 'Вуллонгонг', 'Джилонг',
  'Окленд', 'Веллингтон', 'Крайстчерч', 'Гамильтон', 'Данидин',
  
  // Африка
  'Каир', 'Лагос', 'Киншаса', 'Йоханнесбург', 'Луанда', 'Касабланка', 'Кейптаун', 'Александрия', 'Аддис-Абеба', 'Найроби',
  'Дар-эс-Салам', 'Касабланка', 'Алжир', 'Ибадан', 'Кано', 'Дакар', 'Дурбан', 'Претория',
  
  // Южная Америка
  'Сан-Паулу', 'Лима', 'Богота', 'Рио-де-Жанейро', 'Сантьяго', 'Каракас', 'Буэнос-Айрес', 'Сальвадор', 'Бразилиа',
  'Форталеза', 'Белу-Оризонти', 'Манаус', 'Куритиба', 'Ресифи', 'Порту-Алегри', 'Гояния', 'Белен', 'Гуарульюс',
  
  // Удаленная работа
  'Удаленно', 'Remote', 'Anywhere', 'Work from home', 'Домашний офис'
];

const CitySearch: React.FC<CitySearchProps> = ({
  value,
  onChange,
  placeholder = "Введите город...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = WORLD_CITIES.filter(city => 
        city.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 10);
      setFilteredCities(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const selectCity = (city: string) => {
    onChange(city);
    setInputValue(city);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCities.length > 0) {
        selectCity(filteredCities[0]);
      } else if (inputValue.trim()) {
        onChange(inputValue.trim());
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        onFocus={() => inputValue && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

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
