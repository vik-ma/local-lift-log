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
import {
  useFilterDateRangeAndWeekdays,
  useFilterMinAndMaxValueInputs,
} from "../../hooks";
import {
  ConvertInputStringToNumberOrNull,
  ConvertNumberToInputString,
} from "../../helpers";
import { MODAL_BODY_HEIGHT } from "../../constants";

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

  const filterDateRangeAndWeekdays = useFilterDateRangeAndWeekdays();

  const {
    filterDateRange,
    filterWeekdays,
    setFilterWeekdays,
    areDateRangeAndWeekdaysFiltersEmpty,
  } = filterDateRangeAndWeekdays;

  const {
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
  } = filterDateRange;

  const {
    filterMap,
    handleFilterSaveButton,
    resetFilter,
    weekdayList,
    dietLogFilterValues,
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

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (!areDateRangeAndWeekdaysFiltersEmpty) return true;
    if (!filterMinAndMaxValueInputsCalories.areInputsEmpty) return true;
    if (!filterMinAndMaxValueInputsFat.areInputsEmpty) return true;
    if (!filterMinAndMaxValueInputsCarbs.areInputsEmpty) return true;
    if (!filterMinAndMaxValueInputsProtein.areInputsEmpty) return true;

    return false;
  }, [
    filterMap,
    areDateRangeAndWeekdaysFiltersEmpty,
    filterMinAndMaxValueInputsCalories.areInputsEmpty,
    filterMinAndMaxValueInputsFat.areInputsEmpty,
    filterMinAndMaxValueInputsCarbs.areInputsEmpty,
    filterMinAndMaxValueInputsProtein.areInputsEmpty,
  ]);

  const handleSaveButton = () => {
    if (isFilterButtonDisabled) return;

    const filterValues: DietLogFilterValues = {
      filterMinDate: filterMinDate,
      filterMaxDate: filterMaxDate,
      filterWeekdays: filterWeekdays,
      filterMinCalories: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsCalories.minInput
      ),
      filterMaxCalories: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsCalories.maxInput
      ),
      filterMinFat: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsFat.minInput
      ),
      filterMaxFat: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsFat.maxInput
      ),
      filterMinCarbs: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsCarbs.minInput
      ),
      filterMaxCarbs: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsCarbs.maxInput
      ),
      filterMinProtein: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsProtein.minInput
      ),
      filterMaxProtein: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsProtein.maxInput
      ),
      includeNullInMaxValuesFat:
        filterMinAndMaxValueInputsFat.includeNullInMaxValues,
      includeNullInMaxValuesCarbs:
        filterMinAndMaxValueInputsCarbs.includeNullInMaxValues,
      includeNullInMaxValuesProtein:
        filterMinAndMaxValueInputsProtein.includeNullInMaxValues,
    };

    handleFilterSaveButton(
      userSettings.locale,
      filterValues,
      filterDietLogListModal
    );
  };

  useEffect(() => {
    setFilterMinDate(dietLogFilterValues.filterMinDate);
    setFilterMaxDate(dietLogFilterValues.filterMaxDate);

    setFilterWeekdays(dietLogFilterValues.filterWeekdays);

    filterMinAndMaxValueInputsCalories.setMinInput(
      ConvertNumberToInputString(dietLogFilterValues.filterMinCalories)
    );
    filterMinAndMaxValueInputsCalories.setMaxInput(
      ConvertNumberToInputString(dietLogFilterValues.filterMaxCalories)
    );

    filterMinAndMaxValueInputsFat.setMinInput(
      ConvertNumberToInputString(dietLogFilterValues.filterMinFat)
    );
    filterMinAndMaxValueInputsFat.setMaxInput(
      ConvertNumberToInputString(dietLogFilterValues.filterMaxFat)
    );
    filterMinAndMaxValueInputsFat.setIncludeNullInMaxValues(
      dietLogFilterValues.includeNullInMaxValuesFat
    );

    filterMinAndMaxValueInputsCarbs.setMinInput(
      ConvertNumberToInputString(dietLogFilterValues.filterMinCarbs)
    );
    filterMinAndMaxValueInputsCarbs.setMaxInput(
      ConvertNumberToInputString(dietLogFilterValues.filterMaxCarbs)
    );
    filterMinAndMaxValueInputsCarbs.setIncludeNullInMaxValues(
      dietLogFilterValues.includeNullInMaxValuesCarbs
    );

    filterMinAndMaxValueInputsProtein.setMinInput(
      ConvertNumberToInputString(dietLogFilterValues.filterMinProtein)
    );
    filterMinAndMaxValueInputsProtein.setMaxInput(
      ConvertNumberToInputString(dietLogFilterValues.filterMaxProtein)
    );
    filterMinAndMaxValueInputsProtein.setIncludeNullInMaxValues(
      dietLogFilterValues.includeNullInMaxValuesProtein
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dietLogFilterValues]);

  return (
    <Modal
      isOpen={filterDietLogListModal.isOpen}
      onOpenChange={filterDietLogListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Diet Log Entries</ModalHeader>
            <ModalBody className="py-0">
              <ScrollShadow className={`${MODAL_BODY_HEIGHT}`}>
                <div className="flex flex-col gap-4 w-[24rem]">
                  <FilterDateRangeAndWeekdays
                    useFilterDateRangeAndWeekdays={filterDateRangeAndWeekdays}
                    locale={userSettings.locale}
                    weekdayList={weekdayList}
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
                        showIncludeNullInMaxValuesCheckbox
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Carbs</h3>
                      <FilterMinAndMaxValues
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsCarbs
                        }
                        showIncludeNullInMaxValuesCheckbox
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Protein</h3>
                      <FilterMinAndMaxValues
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsProtein
                        }
                        showIncludeNullInMaxValuesCheckbox
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
