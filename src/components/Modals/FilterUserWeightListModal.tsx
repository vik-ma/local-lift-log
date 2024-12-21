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
};

export const FilterUserWeightListModal = ({
  filterUserWeightListModal,
  useListFilters,
  locale,
}: FilterUserWeightListModalProps) => {
  const {
    filterWeightRange,
    setFilterWeightRange,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
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
              <div className="flex flex-col gap-3">
                <FilterDateRangeAndWeekdays
                  useListFilters={useListFilters}
                  locale={locale}
                  dateRangeLabel="User Weight Dates"
                />
                <div className="flex gap-2">
                  <NumberRangeInput
                    numberRange={filterWeightRange}
                    setNumberRange={setFilterWeightRange}
                    label="Weight Range"
                    numberRangeInvalidityMap={numberRangeInvalidityMap}
                  />
                  <WeightUnitDropdown
                    value={filterWeightRangeUnit}
                    setState={setFilterWeightRangeUnit}
                    targetType="state"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {showResetFilterButton && (
                  <Button variant="flat" color="danger" onPress={resetFilter}>
                    Reset All Filters
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
                    handleFilterSaveButton(locale, filterUserWeightListModal)
                  }
                  isDisabled={
                    numberRangeInvalidityMap.start ||
                    numberRangeInvalidityMap.end
                  }
                >
                  Filter
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
