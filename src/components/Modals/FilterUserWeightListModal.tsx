import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  RangeValue,
  CalendarDate,
} from "@nextui-org/react";
import { UseDisclosureReturnType } from "../../typings";
import { useMemo } from "react";
import { FilterDateRangeAndWeekdays } from "..";

type FilterUserWeightListModalProps = {
  filterUserWeightListModal: UseDisclosureReturnType;
  dateRange: RangeValue<CalendarDate> | null;
  setDateRange: React.Dispatch<
    React.SetStateAction<RangeValue<CalendarDate> | null>
  >;
  filterWeekdays: Set<string>;
  setFilterWeekdays: React.Dispatch<React.SetStateAction<Set<string>>>;
  weekdayMap: Map<string, string>;
  locale: string;
  buttonAction: (locale: string, activeModal: UseDisclosureReturnType) => void;
};

export const FilterUserWeightListModal = ({
  filterUserWeightListModal,
  dateRange,
  setDateRange,
  filterWeekdays,
  setFilterWeekdays,
  weekdayMap,
  locale,
  buttonAction,
}: FilterUserWeightListModalProps) => {
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
    setFilterWeekdays(new Set(weekdayMap.keys()));
  };

  return (
    <Modal
      isOpen={filterUserWeightListModal.isOpen}
      onOpenChange={filterUserWeightListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter User Weights</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <FilterDateRangeAndWeekdays
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  filterWeekdays={filterWeekdays}
                  setFilterWeekdays={setFilterWeekdays}
                  weekdayMap={weekdayMap}
                  locale={locale}
                  dateRangeLabel="User Weight Dates"
                />
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
                  onPress={() =>
                    buttonAction(locale, filterUserWeightListModal)
                  }
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
