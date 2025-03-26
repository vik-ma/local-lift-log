import { FilterMinAndMaxDates, MultipleChoiceWeekdayDropdown } from ".";
import {
  UseDietLogListFiltersReturnType,
  UseListFiltersReturnType,
} from "../typings";

type FilterDateRangeAndWeekdaysProps = {
  useListFilters: UseListFiltersReturnType | UseDietLogListFiltersReturnType;
  locale: string;
};

export const FilterDateRangeAndWeekdays = ({
  useListFilters,
  locale,
}: FilterDateRangeAndWeekdaysProps) => {
  const {
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    isMaxDateBeforeMinDate,
  } = useListFilters;

  return (
    <div className="flex flex-col">
      <FilterMinAndMaxDates
        filterMinDate={filterMinDate}
        setFilterMinDate={setFilterMinDate}
        filterMaxDate={filterMaxDate}
        setFilterMaxDate={setFilterMaxDate}
        locale={locale}
        isMaxDateBeforeMinDate={isMaxDateBeforeMinDate}
      />
      <div className="flex flex-col gap-0.5 pb-1">
        <h3 className="font-semibold text-lg px-0.5">Weekdays</h3>
        <MultipleChoiceWeekdayDropdown
          values={filterWeekdays}
          setValues={setFilterWeekdays}
          weekdayMap={weekdayMap}
        />
      </div>
    </div>
  );
};
