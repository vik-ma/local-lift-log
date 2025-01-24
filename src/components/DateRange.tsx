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
  } = dateRange;

  return (
    <div className={isVertical ? "flex flex-col gap-3" : "flex gap-7"}>
      <I18nProvider locale={locale}>
        <DatePicker
          className="w-[9.25rem]"
          classNames={{ base: "gap-0.5" }}
          dateInputClassNames={{
            inputWrapper: "!bg-default-100",
            innerWrapper: "gap-x-0.5",
          }}
          label={
            <span className="text-base font-medium px-0.5">Start Date</span>
          }
          labelPlacement="outside"
          variant="faded"
          value={startDate}
          onChange={setStartDate}
        />
      </I18nProvider>
      <I18nProvider locale={locale}>
        <DatePicker
          className="w-[9.25rem]"
          classNames={{ base: "gap-0.5" }}
          dateInputClassNames={{
            inputWrapper: "!bg-default-100",
            innerWrapper: "gap-x-0.5",
            errorMessage: "w-[10.5rem]",
            helperWrapper: "px-px",
          }}
          label={<span className="text-base font-medium px-0.5">End Date</span>}
          labelPlacement="outside"
          variant="faded"
          value={endDate}
          onChange={setEndDate}
          isInvalid={isEndDateBeforeStartDate}
          errorMessage="Start Date is before End Date"
        />
      </I18nProvider>
    </div>
  );
};
