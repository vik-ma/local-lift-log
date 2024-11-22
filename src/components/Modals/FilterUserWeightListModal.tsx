import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import {
  UseDisclosureReturnType,
  UseListFiltersReturnType,
} from "../../typings";
import { useMemo } from "react";
import {
  FilterDateRangeAndWeekdays,
  NumberRangeInput,
  WeightUnitDropdown,
} from "..";
import { useNumberRangeInvalidityMap } from "../../hooks";

type FilterUserWeightListModalProps = {
  filterUserWeightListModal: UseDisclosureReturnType;
  useListFilters: UseListFiltersReturnType;
  locale: string;
  buttonAction: (locale: string, activeModal: UseDisclosureReturnType) => void;
};

export const FilterUserWeightListModal = ({
  filterUserWeightListModal,
  useListFilters,
  locale,
  buttonAction,
}: FilterUserWeightListModalProps) => {
  const {
    filterDateRange,
    setFilterDateRange,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    filterWeightRange,
    setFilterWeightRange,
    filterWeightUnit,
    setFilterWeightUnit,
    defaultNumberRange,
  } = useListFilters;

  const showResetButton = useMemo(() => {
    if (filterDateRange !== null) return true;
    if (filterWeekdays!.size < 7) return true;
    if (filterWeightRange.startInput !== "") return true;
    if (filterWeightRange.endInput !== "") return true;

    return false;
  }, [filterDateRange, filterWeekdays, filterWeightRange]);

  const handleResetButton = () => {
    setFilterDateRange(null);
    setFilterWeekdays(new Set(weekdayMap.keys()));
    setFilterWeightRange(defaultNumberRange);
  };

  const numberRangeInvalidityMap =
    useNumberRangeInvalidityMap(filterWeightRange);

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
                  filterDateRange={filterDateRange}
                  setFilterDateRange={setFilterDateRange}
                  filterWeekdays={filterWeekdays}
                  setFilterWeekdays={setFilterWeekdays}
                  weekdayMap={weekdayMap}
                  locale={locale}
                  dateRangeLabel="User Weight Dates"
                />
                <div className="flex gap-2.5">
                  <NumberRangeInput
                    numberRange={filterWeightRange}
                    setNumberRange={setFilterWeightRange}
                    label="Weight Range"
                    numberRangeInvalidityMap={numberRangeInvalidityMap}
                  />
                  <WeightUnitDropdown
                    value={filterWeightUnit}
                    setState={setFilterWeightUnit}
                    targetType="state"
                  />
                </div>
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
                  isDisabled={
                    numberRangeInvalidityMap.start ||
                    numberRangeInvalidityMap.end
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
