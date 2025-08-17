import { TimePeriodFilterValues } from "../../typings";

export const DefaultTimePeriodFilterValues = () => {
  const DEFAULT_TIME_PERIOD_FILTER_VALUES: TimePeriodFilterValues = {
    filterMinStartDate: null,
    filterMaxStartDate: null,
    filterMinEndDate: null,
    filterMaxEndDate: null,
    filterMinDuration: null,
    filterMaxDuration: null,
    filterDietPhaseTypes: new Set(),
    filterHasInjury: new Set(),
    filterStatus: new Set(),
  };

  Object.freeze(DEFAULT_TIME_PERIOD_FILTER_VALUES);

  return DEFAULT_TIME_PERIOD_FILTER_VALUES;
};
