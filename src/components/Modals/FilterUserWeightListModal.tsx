import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@nextui-org/react";
import {
  UseDisclosureReturnType,
  UseFilterMinAndMaxValueInputsReturnType,
  UseListFiltersReturnType,
} from "../../typings";
import {
  FilterDateRangeAndWeekdays,
  FilterMinAndMaxValues,
  WeightUnitDropdown,
} from "..";

type FilterUserWeightListModalProps = {
  filterUserWeightListModal: UseDisclosureReturnType;
  useListFilters: UseListFiltersReturnType;
  filterMinAndMaxValueInputsSecondary: UseFilterMinAndMaxValueInputsReturnType;
  includeNullInMaxValuesSecondary: boolean;
  setIncludeNullInMaxValuesSecondary: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  locale: string;
};

export const FilterUserWeightListModal = ({
  filterUserWeightListModal,
  useListFilters,
  filterMinAndMaxValueInputsSecondary,
  includeNullInMaxValuesSecondary,
  setIncludeNullInMaxValuesSecondary,
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
    filterMinAndMaxValueInputs,
    setFilterMinBodyFatPercentage,
    setFilterMaxBodyFatPercentage,
  } = useListFilters;

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
              <ScrollShadow className="h-[400px]">
                <div className="flex flex-col gap-4 w-[24rem]">
                  <div className="flex flex-col gap-4">
                    <FilterDateRangeAndWeekdays
                      useListFilters={useListFilters}
                      locale={locale}
                    />
                    <div className="flex flex-col gap-0.5">
                      <div className="flex flex-col gap-px">
                        <h3 className="text-lg font-semibold px-0.5">Weight</h3>
                        <div className="flex gap-5">
                          <FilterMinAndMaxValues
                            setFilterMinValue={setFilterMinWeight}
                            setFilterMaxValue={setFilterMaxWeight}
                            label="Weight"
                            useFilterMinAndMaxValueInputs={
                              filterMinAndMaxValueInputs
                            }
                          />
                          <WeightUnitDropdown
                            value={filterWeightRangeUnit}
                            setState={setFilterWeightRangeUnit}
                            targetType="state"
                            showBigLabel
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-px">
                        <h3 className="text-lg font-semibold px-0.5">
                          Body Fat Percentage
                        </h3>
                        <FilterMinAndMaxValues
                          setFilterMinValue={setFilterMinBodyFatPercentage}
                          setFilterMaxValue={setFilterMaxBodyFatPercentage}
                          label="%"
                          useFilterMinAndMaxValueInputs={
                            filterMinAndMaxValueInputsSecondary
                          }
                          includeNullInMaxValues={
                            includeNullInMaxValuesSecondary
                          }
                          setIncludeNullInMaxValues={
                            setIncludeNullInMaxValuesSecondary
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {showResetFilterButton && (
                  <Button variant="flat" onPress={resetFilter}>
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
                    filterMinAndMaxValueInputs.isFilterInvalid ||
                    filterMinAndMaxValueInputsSecondary.isFilterInvalid
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
