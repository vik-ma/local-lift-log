import { FilterMinAndMaxDates, MultipleChoiceWeekdayDropdown } from ".";
import { UseFilterDateRangeAndWeekdaysReturnType } from "../typings";

type FilterDateRangeAndWeekdaysProps = {
  useFilterDateRangeAndWeekdays: UseFilterDateRangeAndWeekdaysReturnType;
  locale: string;
  weekdayMap: Map<string, string>;
};

export const FilterDateRangeAndWeekdays = ({
  useFilterDateRangeAndWeekdays,
  locale,
  weekdayMap,
}: FilterDateRangeAndWeekdaysProps) => {
  const {
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
    filterWeekdays,
    setFilterWeekdays,
  } = useFilterDateRangeAndWeekdays;

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
