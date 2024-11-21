import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  DateRangePicker,
  RangeValue,
  CalendarDate,
} from "@nextui-org/react";
import { UseDisclosureReturnType } from "../../typings";
import { I18nProvider } from "@react-aria/i18n";
import { useMemo } from "react";
import { WeekdaysDropdown } from "..";

type DateRangeModalProps = {
  dateRangeModal: UseDisclosureReturnType;
  dateRange: RangeValue<CalendarDate> | null;
  setDateRange: React.Dispatch<
    React.SetStateAction<RangeValue<CalendarDate> | null>
  >;
  header: string;
  locale: string;
  buttonAction: (locale: string, activeModal: UseDisclosureReturnType) => void;
  customLabel?: string;
  filterWeekdays?: Set<string>;
  setFilterWeekdays?: React.Dispatch<React.SetStateAction<Set<string>>>;
  weekdayMap?: Map<string, string>;
};

export const DateRangeModal = ({
  dateRangeModal,
  dateRange,
  setDateRange,
  header,
  locale,
  buttonAction,
  customLabel,
  filterWeekdays,
  setFilterWeekdays,
  weekdayMap,
}: DateRangeModalProps) => {
  const showWeekDayDropdown = useMemo(() => {
    return (
      filterWeekdays !== undefined &&
      setFilterWeekdays !== undefined &&
      weekdayMap !== undefined
    );
  }, [filterWeekdays, setFilterWeekdays, weekdayMap]);

  const showResetButton = useMemo(() => {
    if (!showWeekDayDropdown) {
      return dateRange !== null;
    }

    return dateRange !== null || filterWeekdays!.size < 7;
  }, [dateRange, filterWeekdays, showWeekDayDropdown]);

  const handleResetButton = () => {
    setDateRange(null);

    if (setFilterWeekdays !== undefined && weekdayMap !== undefined) {
      setFilterWeekdays(new Set(weekdayMap.keys()));
    }
  };

  return (
    <Modal
      isOpen={dateRangeModal.isOpen}
      onOpenChange={dateRangeModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <div
                className={
                  showWeekDayDropdown
                    ? "h-32 flex flex-col gap-4"
                    : "h-16 flex flex-col gap-4"
                }
              >
                <I18nProvider locale={locale}>
                  <DateRangePicker
                    label={customLabel !== undefined ? customLabel : header}
                    variant="faded"
                    value={dateRange}
                    onChange={setDateRange}
                    visibleMonths={2}
                  />
                </I18nProvider>
                {showWeekDayDropdown && (
                  <WeekdaysDropdown
                    values={filterWeekdays!}
                    setValues={setFilterWeekdays!}
                    weekdayMap={weekdayMap!}
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {showResetButton && (
                  <Button variant="flat" onPress={handleResetButton}>
                    Reset
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => buttonAction(locale, dateRangeModal)}
                >
                  Done
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
