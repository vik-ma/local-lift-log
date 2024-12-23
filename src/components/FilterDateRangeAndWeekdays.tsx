import { FilterMinAndMaxDates, WeekdaysDropdown } from ".";
import { UseListFiltersReturnType } from "../typings";

type FilterDateRangeAndWeekdaysProps = {
  useListFilters: UseListFiltersReturnType;
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
    isEndDateBeforeStartDate,
  } = useListFilters;

  return (
    <>
      <FilterMinAndMaxDates
        filterMinDate={filterMinDate}
        setFilterMinDate={setFilterMinDate}
        filterMaxDate={filterMaxDate}
        setFilterMaxDate={setFilterMaxDate}
        locale={locale}
        isEndDateBeforeStartDate={isEndDateBeforeStartDate}
      />
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg px-0.5">Weekdays</h3>
        <WeekdaysDropdown
          values={filterWeekdays}
          setValues={setFilterWeekdays}
          weekdayMap={weekdayMap}
        />
      </div>
    </>
  );
};
