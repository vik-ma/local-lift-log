import {
  DietLogFilterValues,
  UseDietLogListReturnType,
  UserSettings,
} from "../../typings";
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
import { useEffect, useMemo } from "react";
import { useFilterMinAndMaxValueInputs } from "../../hooks";
import {
  ConvertInputStringToNumberOrNull,
  ConvertNumberToInputString,
} from "../../helpers";

type FilterDietLogListModalProps = {
  useDietLogList: UseDietLogListReturnType;
  userSettings: UserSettings;
};

export const FilterDietLogListModal = ({
  useDietLogList,
  userSettings,
}: FilterDietLogListModalProps) => {
  const { filterDietLogListModal, dietLogListFilters } = useDietLogList;

  const filterMinAndMaxValueInputsCalories = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsFat = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsCarbs = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsProtein = useFilterMinAndMaxValueInputs();

  const {
    showResetFilterButton,
    handleFilterSaveButton,
    resetFilter,
    isMaxDateBeforeMinDate,
    filterMinCalories,
    filterMaxCalories,
    filterMinFat,
    filterMaxFat,
    filterMinCarbs,
    filterMaxCarbs,
    filterMinProtein,
    filterMaxProtein,
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

  useEffect(() => {
    if (!filterDietLogListModal.isOpen) return;

    filterMinAndMaxValueInputsCalories.setMinInput(
      ConvertNumberToInputString(filterMinCalories)
    );
    filterMinAndMaxValueInputsCalories.setMaxInput(
      ConvertNumberToInputString(filterMaxCalories)
    );

    filterMinAndMaxValueInputsFat.setMinInput(
      ConvertNumberToInputString(filterMinFat)
    );
    filterMinAndMaxValueInputsFat.setMaxInput(
      ConvertNumberToInputString(filterMaxFat)
    );

    filterMinAndMaxValueInputsCarbs.setMinInput(
      ConvertNumberToInputString(filterMinCarbs)
    );
    filterMinAndMaxValueInputsCarbs.setMaxInput(
      ConvertNumberToInputString(filterMaxCarbs)
    );

    filterMinAndMaxValueInputsProtein.setMinInput(
      ConvertNumberToInputString(filterMinProtein)
    );

    filterMinAndMaxValueInputsProtein.setMaxInput(
      ConvertNumberToInputString(filterMaxProtein)
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDietLogListModal.isOpen]);

  const handleSaveButton = () => {
    if (isFilterButtonDisabled) return;

    const filterValues: DietLogFilterValues = {
      filterValueMinCalories: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsCalories.minInput
      ),
      filterValueMaxCalories: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsCalories.maxInput
      ),
      filterValueMinFat: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsFat.minInput
      ),
      filterValueMaxFat: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsFat.maxInput
      ),
      filterValueMinCarbs: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsCarbs.minInput
      ),
      filterValueMaxCarbs: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsCarbs.maxInput
      ),
      filterValueMinProtein: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsProtein.minInput
      ),
      filterValueMaxProtein: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsProtein.maxInput
      ),
    };

    handleFilterSaveButton(filterDietLogListModal, filterValues);
  };

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
                        label="Calories"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsCalories
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Fat</h3>
                      <FilterMinAndMaxValues
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsFat
                        }
                        includeNullInMaxValues={
                          filterMinAndMaxValueInputsFat.includeNullInMaxValues
                        }
                        setIncludeNullInMaxValues={
                          filterMinAndMaxValueInputsFat.setIncludeNullInMaxValues
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Carbs</h3>
                      <FilterMinAndMaxValues
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsCarbs
                        }
                        includeNullInMaxValues={
                          filterMinAndMaxValueInputsCarbs.includeNullInMaxValues
                        }
                        setIncludeNullInMaxValues={
                          filterMinAndMaxValueInputsCarbs.setIncludeNullInMaxValues
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Protein</h3>
                      <FilterMinAndMaxValues
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsProtein
                        }
                        includeNullInMaxValues={
                          filterMinAndMaxValueInputsProtein.includeNullInMaxValues
                        }
                        setIncludeNullInMaxValues={
                          filterMinAndMaxValueInputsProtein.setIncludeNullInMaxValues
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
                  onPress={handleSaveButton}
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
