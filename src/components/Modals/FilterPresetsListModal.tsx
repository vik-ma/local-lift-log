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
  DistanceUnitDropdown,
  FilterMinAndMaxValues,
  MultipleChoiceUnitDropdown,
  WeightUnitDropdown,
} from "..";
import { useFilterMinAndMaxValueInputs } from "../../hooks";
import { useMemo } from "react";

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
    setFilterMinWeight,
    setFilterMaxWeight,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
    filterWeightUnits,
    setFilterWeightUnits,
    setFilterMinDistance,
    setFilterMaxDistance,
    filterDistanceRangeUnit,
    setFilterDistanceRangeUnit,
    filterDistanceUnits,
    setFilterDistanceUnits,
  } = listFilters;

  const filterMinAndMaxValueInputsWeight = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsDistance = useFilterMinAndMaxValueInputs();

  const isFilterButtonDisabled = useMemo(() => {
    if (presetsType === "equipment")
      return (
        filterMinAndMaxValueInputsWeight.isMinInputInvalid ||
        filterMinAndMaxValueInputsWeight.isMaxInputInvalid ||
        filterMinAndMaxValueInputsWeight.isMaxValueBelowMinValue
      );
    else
      return (
        filterMinAndMaxValueInputsDistance.isMinInputInvalid ||
        filterMinAndMaxValueInputsDistance.isMaxInputInvalid ||
        filterMinAndMaxValueInputsDistance.isMaxValueBelowMinValue
      );
  }, [
    filterMinAndMaxValueInputsWeight,
    filterMinAndMaxValueInputsDistance,
    presetsType,
  ]);

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
                  <div className="flex items-start gap-4">
                    <FilterMinAndMaxValues
                      setFilterMinValue={setFilterMinWeight}
                      setFilterMaxValue={setFilterMaxWeight}
                      label="Weight"
                      useFilterMinAndMaxValueInputs={
                        filterMinAndMaxValueInputsWeight
                      }
                    />
                    <WeightUnitDropdown
                      value={filterWeightRangeUnit}
                      setState={setFilterWeightRangeUnit}
                      targetType="state"
                      showBigLabel
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
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <FilterMinAndMaxValues
                      setFilterMinValue={setFilterMinDistance}
                      setFilterMaxValue={setFilterMaxDistance}
                      label="Distance"
                      useFilterMinAndMaxValueInputs={
                        filterMinAndMaxValueInputsDistance
                      }
                    />
                    <DistanceUnitDropdown
                      value={filterDistanceRangeUnit}
                      setState={setFilterDistanceRangeUnit}
                      targetType="state"
                      showBigLabel
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg px-0.5">
                      Distance Units
                    </h3>
                    <MultipleChoiceUnitDropdown
                      unitType="distance"
                      filterUnits={filterDistanceUnits}
                      setFilterUnits={setFilterDistanceUnits}
                    />
                  </div>
                </div>
              )}
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
                    handleFilterSaveButton(
                      userSettings.locale,
                      filterPresetsListModal
                    )
                  }
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
