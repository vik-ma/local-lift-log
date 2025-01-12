import { UseDietLogListReturnType, UserSettings } from "../../typings";
import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@nextui-org/react";
import { FilterDateRangeAndWeekdays, FilterMinAndMaxValues } from "..";
import { useFilterMinAndMaxValueInputs } from "../../hooks";

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
  } = dietLogListFilters;

  const filterMinAndMaxValueInputsCalories = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsFat = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsCarbs = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsProtein = useFilterMinAndMaxValueInputs();

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
                    <div className="flex flex-col gap-px">
                      <h3 className="text-lg font-semibold px-0.5">Fat</h3>
                      <FilterMinAndMaxValues
                        setFilterMinValue={setFilterMinFat}
                        setFilterMaxValue={setFilterMaxFat}
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsFat
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-px">
                      <h3 className="text-lg font-semibold px-0.5">Carbs</h3>
                      <FilterMinAndMaxValues
                        setFilterMinValue={setFilterMinCarbs}
                        setFilterMaxValue={setFilterMaxCarbs}
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsCarbs
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-px">
                      <h3 className="text-lg font-semibold px-0.5">Protein</h3>
                      <FilterMinAndMaxValues
                        setFilterMinValue={setFilterMinProtein}
                        setFilterMaxValue={setFilterMaxProtein}
                        label="Grams"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsProtein
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
                  // TODO: FIX
                  // isDisabled={isFilterButtonDisabled}
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
