import { FilterMinAndMaxDates, MultipleChoiceWeekdayDropdown } from ".";
import { UseFilterDateRangeAndWeekdaysReturnType } from "../typings";

type FilterDateRangeAndWeekdaysProps = {
  useFilterDateRangeAndWeekdays: UseFilterDateRangeAndWeekdaysReturnType;
  locale: string;
  weekdayList: readonly string[];
};

export const FilterDateRangeAndWeekdays = ({
  useFilterDateRangeAndWeekdays,
  locale,
  weekdayList,
}: FilterDateRangeAndWeekdaysProps) => {
  const { filterDateRange, filterWeekdays, setFilterWeekdays } =
    useFilterDateRangeAndWeekdays;

  return (
    <div className="flex flex-col">
      <FilterMinAndMaxDates
        useFilterDateRange={filterDateRange}
        locale={locale}
      />
      <div className="flex flex-col gap-0.5 pb-1">
        <h3 className="font-semibold text-lg px-0.5">Weekdays</h3>
        <MultipleChoiceWeekdayDropdown
          values={filterWeekdays}
          setValues={setFilterWeekdays}
          weekdayList={weekdayList}
        />
      </div>
    </div>
  );
};
