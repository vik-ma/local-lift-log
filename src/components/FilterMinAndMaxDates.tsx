import { Button, DatePicker, DateValue } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { UseFilterDateRangeReturnType } from "../typings";

type FilterMinAndMaxDatesProps = {
  useFilterDateRange: UseFilterDateRangeReturnType;
  locale: string;
  customLabel?: string;
  isSmallLabel?: boolean;
  isDateUnavailable?: (date: DateValue) => boolean;
};

export const FilterMinAndMaxDates = ({
  useFilterDateRange,
  locale,
  customLabel,
  isSmallLabel,
  isDateUnavailable,
}: FilterMinAndMaxDatesProps) => {
  const {
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
  } = useFilterDateRange;

  return (
    <div
      className={
        isSmallLabel
          ? "flex gap-4 justify-between"
          : "flex gap-4 justify-between pt-1"
      }
    >
      <div className="relative w-full">
        <I18nProvider locale={locale}>
          <DatePicker
            classNames={{
              base: "gap-0.5",
              inputWrapper: "!bg-default-100",
              label: "text-neutral-700",
            }}
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
            isDateUnavailable={isDateUnavailable}
          />
        </I18nProvider>
        {filterMinDate !== null && (
          <Button
            aria-label={
              customLabel !== undefined
                ? `Reset Min ${customLabel}`
                : "Reset Min Date"
            }
            className={
              isSmallLabel
                ? "absolute right-0 -top-1.5 h-7"
                : "absolute right-0 -top-0.5 h-7"
            }
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
            classNames={{
              base: "gap-0.5",
              inputWrapper: "!bg-default-100",
              helperWrapper: "px-0.5",
              label: "text-neutral-700",
              segment: "data-[invalid=true]:focus:bg-danger-600/15",
            }}
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
            isDateUnavailable={isDateUnavailable}
          />
        </I18nProvider>
        {filterMaxDate !== null && (
          <Button
            aria-label={
              customLabel !== undefined
                ? `Reset Max ${customLabel}`
                : "Reset Max Date"
            }
            className={
              isSmallLabel
                ? "absolute right-0 -top-1.5 h-7"
                : "absolute right-0 -top-0.5 h-7"
            }
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
