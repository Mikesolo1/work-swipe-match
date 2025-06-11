
import { z } from 'zod';

// Схемы валидации для форм
export const userProfileSchema = z.object({
  first_name: z.string()
    .min(1, 'Имя обязательно')
    .max(50, 'Имя слишком длинное'),
  last_name: z.string()
    .max(50, 'Фамилия слишком длинная')
    .optional(),
  city: z.string()
    .max(100, 'Название города слишком длинное')
    .optional(),
  skills: z.array(z.string())
    .max(20, 'Слишком много навыков')
    .optional(),
  experience: z.string()
    .max(1000, 'Описание опыта слишком длинное')
    .optional(),
  achievement: z.string()
    .max(500, 'Описание достижения слишком длинное')
    .optional(),
  salary_expectation: z.number()
    .min(0, 'Зарплата не может быть отрицательной')
    .max(10000000, 'Зарплата слишком большая')
    .optional(),
  portfolio_url: z.string()
    .url('Некорректная ссылка на портфолио')
    .optional()
    .or(z.literal('')),
  resume_url: z.string()
    .url('Некорректная ссылка на резюме')
    .optional()
    .or(z.literal('')),
  company: z.string()
    .max(100, 'Название компании слишком длинное')
    .optional(),
});

export const vacancySchema = z.object({
  title: z.string()
    .min(1, 'Название вакансии обязательно')
    .max(100, 'Название слишком длинное'),
  description: z.string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(2000, 'Описание слишком длинное'),
  city: z.string()
    .min(1, 'Город обязателен')
    .max(100, 'Название города слишком длинное'),
  skills_required: z.array(z.string())
    .max(15, 'Слишком много требуемых навыков')
    .optional(),
  salary_min: z.number()
    .min(0, 'Минимальная зарплата не может быть отрицательной')
    .optional(),
  salary_max: z.number()
    .min(0, 'Максимальная зарплата не может быть отрицательной')
    .optional(),
  team_lead_name: z.string()
    .max(100, 'Имя тимлида слишком длинное')
    .optional(),
  team_lead_avatar: z.string()
    .url('Некорректная ссылка на аватар')
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  if (data.salary_min && data.salary_max) {
    return data.salary_min <= data.salary_max;
  }
  return true;
}, {
  message: 'Минимальная зарплата не может быть больше максимальной',
  path: ['salary_max'],
});

// Типы на основе схем
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type VacancyFormData = z.infer<typeof vacancySchema>;

// Функции валидации
export const validateUserProfile = (data: unknown): UserProfileFormData => {
  return userProfileSchema.parse(data);
};

export const validateVacancy = (data: unknown): VacancyFormData => {
  return vacancySchema.parse(data);
};

// Безопасная валидация с возвратом ошибок
export const safeValidateUserProfile = (data: unknown) => {
  const result = userProfileSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : null,
    errors: result.success ? null : result.error.errors,
  };
};

export const safeValidateVacancy = (data: unknown) => {
  const result = vacancySchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : null,
    errors: result.success ? null : result.error.errors,
  };
};
