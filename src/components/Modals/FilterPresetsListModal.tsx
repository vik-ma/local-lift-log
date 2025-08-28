import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@heroui/react";
import { UsePresetsListReturnType, UserSettings } from "../../typings";
import {
  DistanceUnitDropdown,
  FilterMinAndMaxValues,
  MultipleChoiceUnitDropdown,
  WeightUnitDropdown,
} from "..";
import { useFilterMinAndMaxValueInputs } from "../../hooks";
import { useMemo, useState } from "react";

type FilterPresetsListModalProps = {
  usePresetsList: UsePresetsListReturnType;
  userSettings: UserSettings;
};

export const FilterPresetsListModal = ({
  usePresetsList,
  userSettings,
}: FilterPresetsListModalProps) => {
  const [filterWeightRangeUnit, setFilterWeightRangeUnit] =
    useState<string>("kg");
  const [filterDistanceRangeUnit, setFilterDistanceRangeUnit] =
    useState<string>("km");
  const [filterWeightUnits, setFilterWeightUnits] = useState<Set<string>>(
    new Set()
  );
  const [filterDistanceUnits, setFilterDistanceUnits] = useState<Set<string>>(
    new Set()
  );

  const {
    filterPresetsListModal,
    listFiltersEquipment,
    listFiltersDistance,
    presetsType,
    presetsTypeString,
  } = usePresetsList;

  const filterMinAndMaxValueInputsWeight = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsDistance = useFilterMinAndMaxValueInputs();

  const isFilterButtonDisabled = useMemo(() => {
    if (presetsType === "equipment") {
      if (filterMinAndMaxValueInputsWeight.isFilterInvalid) return true;
    } else {
      if (filterMinAndMaxValueInputsDistance.isFilterInvalid) return true;
    }

    return false;
  }, [
    presetsType,
    filterMinAndMaxValueInputsWeight.isFilterInvalid,
    filterMinAndMaxValueInputsDistance.isFilterInvalid,
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
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-px">
                    <h3 className="text-lg font-semibold px-0.5">Weight</h3>
                    <div className="flex gap-5">
                      <FilterMinAndMaxValues
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
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-px">
                    <h3 className="text-lg font-semibold px-0.5">Distance</h3>
                    <div className="flex gap-5">
                      <FilterMinAndMaxValues
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
                  <Button
                    variant="flat"
                    color="danger"
                    onPress={() => resetFilter(userSettings)}
                  >
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
