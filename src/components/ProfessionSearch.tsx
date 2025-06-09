
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

interface ProfessionSearchProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  className?: string;
}

// Обширный список IT профессий и навыков
const IT_SKILLS = [
  // Языки программирования
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Lua', 'Dart', 'Elixir',
  
  // Frontend
  'React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Ant Design', 'jQuery', 'Webpack', 'Vite', 'Parcel',
  
  // Backend
  'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Ruby on Rails', 'Laravel', 'Symfony', 'CodeIgniter', 'Gin', 'Echo', 'Fiber',
  
  // Базы данных
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB', 'ClickHouse', 'ElasticSearch', 'InfluxDB',
  
  // DevOps
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant',
  
  // Мобильная разработка
  'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic', 'Cordova', 'Unity', 'Unreal Engine',
  
  // Тестирование
  'Jest', 'Cypress', 'Selenium', 'Playwright', 'Postman', 'JUnit', 'PyTest', 'Mocha', 'Chai', 'TestNG',
  
  // Аналитика и Data Science
  'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Jupyter', 'Tableau', 'Power BI', 'Apache Spark',
  
  // Другие технологии
  'GraphQL', 'REST API', 'gRPC', 'WebSocket', 'OAuth', 'JWT', 'Microservices', 'Blockchain', 'Machine Learning', 'AI',
  
  // Управление проектами
  'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Trello', 'Asana', 'Monday.com'
];

const ProfessionSearch: React.FC<ProfessionSearchProps> = ({
  value,
  onChange,
  placeholder = "Начните вводить навык...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = IT_SKILLS.filter(skill => 
        skill.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(skill)
      ).slice(0, 10);
      setFilteredSkills(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSkills([]);
      setShowSuggestions(false);
    }
  }, [inputValue, value]);

  const addSkill = (skill: string) => {
    if (!value.includes(skill)) {
      onChange([...value, skill]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() && !value.includes(inputValue.trim())) {
        addSkill(inputValue.trim());
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
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

      {showSuggestions && filteredSkills.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => addSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessionSearch;
