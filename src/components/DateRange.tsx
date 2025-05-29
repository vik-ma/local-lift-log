import { DatePicker } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { UseDateRangeReturnType } from "../typings";

type DateRangeProps = {
  dateRange: UseDateRangeReturnType;
  locale: string;
  isVertical?: boolean;
};

export const DateRange = ({
  dateRange,
  locale,
  isVertical,
}: DateRangeProps) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isEndDateBeforeStartDate,
    isStartDateBeforeEpoch,
    isEndDateBeforeEpoch,
  } = dateRange;

  return (
    <div className={isVertical ? "flex flex-col gap-3" : "flex gap-7"}>
      <I18nProvider locale={locale}>
        <DatePicker
          className="w-[9.25rem]"
          classNames={{
            base: "gap-0.5",
            inputWrapper: "!bg-default-100",
            innerWrapper: "gap-x-0.5",
            label: "text-neutral-700",
          }}
          label={
            <span className="text-base font-medium px-0.5">Start Date</span>
          }
          labelPlacement="outside"
          variant="faded"
          value={startDate}
          onChange={setStartDate}
          isInvalid={isStartDateBeforeEpoch}
          errorMessage="Invalid Date"
        />
      </I18nProvider>
      <I18nProvider locale={locale}>
        <DatePicker
          className="w-[9.25rem]"
          classNames={{
            base: "gap-0.5",
            inputWrapper: "!bg-default-100",
            innerWrapper: "gap-x-0.5",
            errorMessage: "w-[10.5rem]",
            helperWrapper: "px-px",
            label: "text-neutral-700",
            segment: "data-[invalid=true]:focus:bg-danger-600/15",
          }}
          label={<span className="text-base font-medium px-0.5">End Date</span>}
          labelPlacement="outside"
          variant="faded"
          value={endDate}
          onChange={setEndDate}
          isInvalid={isEndDateBeforeEpoch || isEndDateBeforeStartDate}
          errorMessage={
            isEndDateBeforeEpoch
              ? "Invalid Date"
              : "End Date is before Start Date"
          }
        />
      </I18nProvider>
    </div>
  );
};
