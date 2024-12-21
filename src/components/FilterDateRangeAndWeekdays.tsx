import { DateRangePicker } from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import { WeekdaysDropdown } from ".";
import { UseListFiltersReturnType } from "../typings";

type FilterDateRangeAndWeekdaysProps = {
  useListFilters: UseListFiltersReturnType;
  locale: string;
  dateRangeLabel: string;
};

export const FilterDateRangeAndWeekdays = ({
  useListFilters,
  locale,
  dateRangeLabel,
}: FilterDateRangeAndWeekdaysProps) => {
  const {
    filterDateRange,
    setFilterDateRange,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
  } = useListFilters;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg px-0.5">Date Range</h3>
        <I18nProvider locale={locale}>
          <DateRangePicker
            label={dateRangeLabel}
            variant="faded"
            value={filterDateRange}
            onChange={setFilterDateRange}
            visibleMonths={2}
          />
        </I18nProvider>
      </div>
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
