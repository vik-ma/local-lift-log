import { Button, CalendarDate, DatePicker } from "@nextui-org/react";
import { I18nProvider } from "@react-aria/i18n";

type FilterMinAndMaxDatesProps = {
  filterMinDate: CalendarDate | null;
  setFilterMinDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  filterMaxDate: CalendarDate | null;
  setFilterMaxDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  locale: string;
  isMaxDateBeforeMinDate: boolean;
  customLabel?: string;
  isSmallLabel?: boolean;
};

export const FilterMinAndMaxDates = ({
  filterMinDate,
  setFilterMinDate,
  filterMaxDate,
  setFilterMaxDate,
  locale,
  isMaxDateBeforeMinDate,
  customLabel,
  isSmallLabel,
}: FilterMinAndMaxDatesProps) => {
  return (
    <div className="flex gap-4 justify-between pt-1">
      <div className="relative w-full">
        <I18nProvider locale={locale}>
          <DatePicker
            classNames={{ base: "gap-0.5" }}
            dateInputClassNames={{ inputWrapper: "!bg-default-100" }}
            label={
              <span
                className={
                  isSmallLabel
                    ? "text-base font-semibold px-0.5"
                    : "text-lg font-semibold px-0.5"
                }
              >
                {customLabel !== undefined ? `Min ${customLabel}` : "Min Date"}
              </span>
            }
            labelPlacement="outside"
            variant="faded"
            value={filterMinDate}
            onChange={setFilterMinDate}
          />
        </I18nProvider>
        {filterMinDate !== null && (
          <Button
            aria-label={
              customLabel !== undefined
                ? `Reset Min ${customLabel}`
                : "Reset Min Date"
            }
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
              <span
                className={
                  isSmallLabel
                    ? "text-base font-semibold px-0.5"
                    : "text-lg font-semibold px-0.5"
                }
              >
                {customLabel !== undefined ? `Max ${customLabel}` : "Max Date"}
              </span>
            }
            labelPlacement="outside"
            variant="faded"
            value={filterMaxDate}
            onChange={setFilterMaxDate}
            isInvalid={isMaxDateBeforeMinDate}
            errorMessage="Max Date is before Min Date"
          />
        </I18nProvider>
        {filterMaxDate !== null && (
          <Button
            aria-label={
              customLabel !== undefined
                ? `Reset Max ${customLabel}`
                : "Reset Max Date"
            }
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
  );
};
