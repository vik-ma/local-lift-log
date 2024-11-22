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
    showResetFilterButton,
    resetFilter,
  } = useListFilters;

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
                {showResetFilterButton && (
                  <Button variant="flat" onPress={resetFilter}>
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
