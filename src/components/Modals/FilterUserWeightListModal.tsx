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
  FilterMinAndMaxValues,
  WeightUnitDropdown,
} from "..";
import { useFilterMinAndMaxValueInputs } from "../../hooks";

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
    setFilterMinWeight,
    setFilterMaxWeight,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
    isMaxDateBeforeMinDate,
  } = useListFilters;

  const filterMinAndMaxValueInputs = useFilterMinAndMaxValueInputs();

  const handleResetAllFiltersButton = () => {
    resetFilter();
    filterMinAndMaxValueInputs.resetInputs();
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
                  useListFilters={useListFilters}
                  locale={locale}
                />
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-lg font-semibold px-0.5">Weight</h3>
                  <div className="flex gap-5">
                    <FilterMinAndMaxValues
                      setFilterMinValue={setFilterMinWeight}
                      setFilterMaxValue={setFilterMaxWeight}
                      label="Weight"
                      useFilterMinAndMaxValueInputs={filterMinAndMaxValueInputs}
                    />
                    <WeightUnitDropdown
                      value={filterWeightRangeUnit}
                      setState={setFilterWeightRangeUnit}
                      targetType="state"
                      showBigLabel
                    />
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {showResetFilterButton && (
                  <Button variant="flat" onPress={handleResetAllFiltersButton}>
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
                    isMaxDateBeforeMinDate ||
                    filterMinAndMaxValueInputs.isMinInputInvalid ||
                    filterMinAndMaxValueInputs.isMaxInputInvalid ||
                    filterMinAndMaxValueInputs.isMaxValueBelowMinValue
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
