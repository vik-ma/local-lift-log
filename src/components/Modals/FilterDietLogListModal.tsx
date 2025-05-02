import { UseDietLogListReturnType, UserSettings } from "../../typings";
import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@heroui/react";
import { FilterDateRangeAndWeekdays, FilterMinAndMaxValues } from "..";
import { useMemo } from "react";

type FilterDietLogListModal = {
  useDietLogList: UseDietLogListReturnType;
  userSettings: UserSettings;
};

export const FilterDietLogListModal = ({
  useDietLogList,
  userSettings,
}: FilterDietLogListModal) => {
  const { filterDietLogListModal, dietLogListFilters } = useDietLogList;

  const {
    setFilterMinCalories,
    setFilterMaxCalories,
    setFilterMinFat,
    setFilterMaxFat,
    setFilterMinCarbs,
    setFilterMaxCarbs,
    setFilterMinProtein,
    setFilterMaxProtein,
    showResetFilterButton,
    handleFilterSaveButton,
    resetFilter,
    isMaxDateBeforeMinDate,
    filterMinAndMaxValueInputsCalories,
    filterMinAndMaxValueInputsFat,
    filterMinAndMaxValueInputsCarbs,
    filterMinAndMaxValueInputsProtein,
    includeNullInMaxValuesFat,
    setIncludeNullInMaxValuesFat,
    includeNullInMaxValuesCarbs,
    setIncludeNullInMaxValuesCarbs,
    includeNullInMaxValuesProtein,
    setIncludeNullInMaxValuesProtein,
  } = dietLogListFilters;

  const isFilterButtonDisabled = useMemo(() => {
    if (isMaxDateBeforeMinDate) return true;
    if (filterMinAndMaxValueInputsCalories.isFilterInvalid) return true;
    if (filterMinAndMaxValueInputsFat.isFilterInvalid) return true;
    if (filterMinAndMaxValueInputsCarbs.isFilterInvalid) return true;
    if (filterMinAndMaxValueInputsProtein.isFilterInvalid) return true;

    return false;
  }, [
    isMaxDateBeforeMinDate,
    filterMinAndMaxValueInputsCalories.isFilterInvalid,
    filterMinAndMaxValueInputsFat.isFilterInvalid,
    filterMinAndMaxValueInputsCarbs.isFilterInvalid,
    filterMinAndMaxValueInputsProtein.isFilterInvalid,
  ]);

  return (
    <Modal
      isOpen={filterDietLogListModal.isOpen}
      onOpenChange={filterDietLogListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Diet Log Entries</ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[400px]">
                <div className="flex flex-col gap-4 w-[24rem]">
                  <FilterDateRangeAndWeekdays
                    useListFilters={dietLogListFilters}
                    locale={userSettings.locale}
                  />
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-px">
                      <h3 className="text-lg font-semibold px-0.5">Calories</h3>
                      <FilterMinAndMaxValues
                        setFilterMinValue={setFilterMinCalories}
                        setFilterMaxValue={setFilterMaxCalories}
                        label="Calories"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsCalories
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Fat</h3>
                      <FilterMinAndMaxValues
                        setFilterMinValue={setFilterMinFat}
                        setFilterMaxValue={setFilterMaxFat}
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsFat
                        }
                        includeNullInMaxValues={includeNullInMaxValuesFat}
                        setIncludeNullInMaxValues={setIncludeNullInMaxValuesFat}
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Carbs</h3>
                      <FilterMinAndMaxValues
                        setFilterMinValue={setFilterMinCarbs}
                        setFilterMaxValue={setFilterMaxCarbs}
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsCarbs
                        }
                        includeNullInMaxValues={includeNullInMaxValuesCarbs}
                        setIncludeNullInMaxValues={
                          setIncludeNullInMaxValuesCarbs
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Protein</h3>
                      <FilterMinAndMaxValues
                        setFilterMinValue={setFilterMinProtein}
                        setFilterMaxValue={setFilterMaxProtein}
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsProtein
                        }
                        includeNullInMaxValues={includeNullInMaxValuesProtein}
                        setIncludeNullInMaxValues={
                          setIncludeNullInMaxValuesProtein
                        }
                      />
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
                  onPress={() => handleFilterSaveButton(filterDietLogListModal)}
                  isDisabled={isFilterButtonDisabled}
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
