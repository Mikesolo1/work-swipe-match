
export interface SwipeFilters {
  city?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  hasVideo?: boolean;
}

export interface FilterStats {
  totalVacancies?: number;
  totalSeekers?: number;
  withVideo?: number;
  cities?: string[];
  avgSalaryMin?: number;
  avgSalaryMax?: number;
  avgSalaryExpectation?: number;
}
