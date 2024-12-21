import { Button, DatePicker } from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";
import { WeekdaysDropdown } from ".";
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
  } = useListFilters;

  return (
    <>
      <div className="flex gap-4 justify-between pt-1">
        <div className="relative w-full">
          <I18nProvider locale={locale}>
            <DatePicker
              classNames={{ base: "gap-0.5" }}
              dateInputClassNames={{ inputWrapper: "!bg-default-100" }}
              label={
                <span className="text-lg font-semibold px-0.5">Min Date</span>
              }
              labelPlacement="outside"
              variant="faded"
              value={filterMinDate}
              onChange={setFilterMinDate}
            />
          </I18nProvider>
          {filterMinDate !== null && (
            <Button
              aria-label="Reset Min Date"
              className="absolute right-0 -top-0.5 h-7"
              size="sm"
              variant="flat"
              onPress={() => setFilterMinDate(null)}
            >
              Reset
            </Button>
          )}
        </div>
        <div className="relative w-full">
          <I18nProvider locale={locale}>
            <DatePicker
              classNames={{ base: "gap-0.5" }}
              dateInputClassNames={{ inputWrapper: "!bg-default-100" }}
              label={
                <span className="text-lg font-semibold px-0.5">Max Date</span>
              }
              labelPlacement="outside"
              variant="faded"
              value={filterMaxDate}
              onChange={setFilterMaxDate}
            />
          </I18nProvider>
          {filterMaxDate !== null && (
            <Button
              aria-label="Reset Max Date"
              className="absolute right-0 -top-0.5 h-7"
              size="sm"
              variant="flat"
              onPress={() => setFilterMaxDate(null)}
            >
              Reset
            </Button>
          )}
        </div>
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
