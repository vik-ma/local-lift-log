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
import { useEffect, useMemo } from "react";
import { useFilterMinAndMaxValueInputs } from "../../hooks";
import { ConvertNumberToInputString } from "../../helpers";

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
    includeNullInMaxValuesFat,
    setIncludeNullInMaxValuesFat,
    includeNullInMaxValuesCarbs,
    setIncludeNullInMaxValuesCarbs,
    includeNullInMaxValuesProtein,
    setIncludeNullInMaxValuesProtein,
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
    filterMinAndMaxValueInputsCalories.setMinInput(
      ConvertNumberToInputString(filterMinCalories)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMinCalories]);

  useEffect(() => {
    filterMinAndMaxValueInputsCalories.setMaxInput(
      ConvertNumberToInputString(filterMaxCalories)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMaxCalories]);

  useEffect(() => {
    filterMinAndMaxValueInputsFat.setMinInput(
      ConvertNumberToInputString(filterMinFat)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMinFat]);

  useEffect(() => {
    filterMinAndMaxValueInputsFat.setMaxInput(
      ConvertNumberToInputString(filterMaxFat)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMaxFat]);

  useEffect(() => {
    filterMinAndMaxValueInputsCarbs.setMinInput(
      ConvertNumberToInputString(filterMinCarbs)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMinCarbs]);

  useEffect(() => {
    filterMinAndMaxValueInputsCarbs.setMaxInput(
      ConvertNumberToInputString(filterMaxCarbs)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMaxCarbs]);

  useEffect(() => {
    filterMinAndMaxValueInputsProtein.setMinInput(
      ConvertNumberToInputString(filterMinProtein)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMinProtein]);

  useEffect(() => {
    filterMinAndMaxValueInputsProtein.setMaxInput(
      ConvertNumberToInputString(filterMaxProtein)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMaxProtein]);

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
                        includeNullInMaxValues={includeNullInMaxValuesFat}
                        setIncludeNullInMaxValues={setIncludeNullInMaxValuesFat}
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold px-0.5">Carbs</h3>
                      <FilterMinAndMaxValues
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
