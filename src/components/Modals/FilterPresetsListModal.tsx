import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import { UsePresetsListReturnType, UserSettings } from "../../typings";
import {
  MultipleChoiceUnitDropdown,
  NumberRangeInput,
  WeightUnitDropdown,
} from "..";
import { useNumberRangeInvalidityMap } from "../../hooks";

type FilterPresetsListModalProps = {
  usePresetsList: UsePresetsListReturnType;
  userSettings: UserSettings;
};

export const FilterPresetsListModal = ({
  usePresetsList,
  userSettings,
}: FilterPresetsListModalProps) => {
  const {
    filterPresetsListModal,
    listFilters,
    presetsType,
    presetsTypeString,
  } = usePresetsList;

  const {
    filterWeightRange,
    setFilterWeightRange,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
    filterWeightUnits,
    setFilterWeightUnits,
  } = listFilters;

  const numberRangeInvalidityMap =
    useNumberRangeInvalidityMap(filterWeightRange);

  return (
    <Modal
      isOpen={filterPresetsListModal.isOpen}
      onOpenChange={filterPresetsListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter {presetsTypeString}</ModalHeader>
            <ModalBody>
              {presetsType === "equipment" ? (
                <div className="flex flex-col gap-3">
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
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg px-0.5">
                      Weight Units
                    </h3>
                    <MultipleChoiceUnitDropdown
                      unitType="weight"
                      filterUnits={filterWeightUnits}
                      setFilterUnits={setFilterWeightUnits}
                    />
                  </div>
                </div>
              ) : (
                // TODO: ADD DISTANCE
                <></>
              )}
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
                    handleFilterSaveButton(
                      userSettings.locale,
                      filterPresetsListModal
                    )
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
