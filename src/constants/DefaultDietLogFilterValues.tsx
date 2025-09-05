import { DietLogFilterValues } from "../typings";

export const DEFAULT_DIET_LOG_FILTER_VALUES: DietLogFilterValues = {
  filterMinDate: null,
  filterMaxDate: null,
  filterWeekdays: new Set(),
  filterMinCalories: null,
  filterMaxCalories: null,
  filterMinFat: null,
  filterMaxFat: null,
  filterMinCarbs: null,
  filterMaxCarbs: null,
  filterMinProtein: null,
  filterMaxProtein: null,
  includeNullInMaxValuesFat: false,
  includeNullInMaxValuesCarbs: false,
  includeNullInMaxValuesProtein: false,
};
