import { CalendarDate, DateRangePicker, RangeValue } from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import { WeekdaysDropdown } from ".";

type FilterDateRangeAndWeekdaysProps = {
  filterDateRange: RangeValue<CalendarDate> | null;
  setFilterDateRange: React.Dispatch<
    React.SetStateAction<RangeValue<CalendarDate> | null>
  >;
  filterWeekdays: Set<string>;
  setFilterWeekdays: React.Dispatch<React.SetStateAction<Set<string>>>;
  weekdayMap: Map<string, string>;
  locale: string;
  dateRangeLabel: string;
};

export const FilterDateRangeAndWeekdays = ({
  filterDateRange,
  setFilterDateRange,
  filterWeekdays,
  setFilterWeekdays,
  weekdayMap,
  locale,
  dateRangeLabel,
}: FilterDateRangeAndWeekdaysProps) => {
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
