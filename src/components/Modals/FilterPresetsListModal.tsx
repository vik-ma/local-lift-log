import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@heroui/react";
import {
  ListFilterValues,
  UsePresetsListReturnType,
  UserSettings,
} from "../../typings";
import {
  DistanceUnitDropdown,
  FilterMinAndMaxValues,
  MultipleChoiceUnitDropdown,
  WeightUnitDropdown,
} from "..";
import { useFilterMinAndMaxValueInputs } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import {
  ConvertInputStringToNumberOrNull,
  ConvertNumberToInputString,
} from "../../helpers";

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

  const showResetFilterButton = useMemo(() => {
    if (presetsType === "equipment") {
      if (listFiltersEquipment.filterMap.size > 0) return true;
      if (filterMinAndMaxValueInputsWeight.areInputsEmpty) return true;
      if (filterWeightUnits.size > 0) return true;
      return false;
    } else {
      if (listFiltersDistance.filterMap.size > 0) return true;
      if (filterMinAndMaxValueInputsDistance.areInputsEmpty) return true;
      if (filterDistanceUnits.size > 0) return true;
      return false;
    }
  }, [
    presetsType,
    listFiltersEquipment.filterMap,
    listFiltersDistance.filterMap,
    filterMinAndMaxValueInputsWeight.areInputsEmpty,
    filterMinAndMaxValueInputsDistance.areInputsEmpty,
    filterWeightUnits,
    filterDistanceUnits,
  ]);

  const handleResetFilterButton = () => {
    if (presetsType === "equipment") {
      listFiltersEquipment.resetFilter(userSettings);
    } else {
      listFiltersDistance.resetFilter(userSettings);
    }
  };

  const handleSaveButton = () => {
    if (isFilterButtonDisabled) return;

    if (presetsType === "equipment") {
      const filterValues: ListFilterValues = {
        ...listFiltersEquipment.listFilterValues,
        filterMinWeight: ConvertInputStringToNumberOrNull(
          filterMinAndMaxValueInputsWeight.minInput
        ),
        filterMaxWeight: ConvertInputStringToNumberOrNull(
          filterMinAndMaxValueInputsWeight.maxInput
        ),
        filterWeightRangeUnit: filterWeightRangeUnit,
        filterWeightUnits: filterWeightUnits,
      };

      listFiltersEquipment.handleFilterSaveButton(
        userSettings.locale,
        filterValues,
        filterPresetsListModal
      );
    } else {
      const filterValues: ListFilterValues = {
        ...listFiltersDistance.listFilterValues,
        filterMinDistance: ConvertInputStringToNumberOrNull(
          filterMinAndMaxValueInputsDistance.minInput
        ),
        filterMaxDistance: ConvertInputStringToNumberOrNull(
          filterMinAndMaxValueInputsDistance.maxInput
        ),
        filterDistanceRangeUnit: filterDistanceRangeUnit,
        filterDistanceUnits: filterDistanceUnits,
      };

      listFiltersDistance.handleFilterSaveButton(
        userSettings.locale,
        filterValues,
        filterPresetsListModal
      );
    }
  };

  useEffect(() => {
    filterMinAndMaxValueInputsWeight.setMinInput(
      ConvertNumberToInputString(
        listFiltersEquipment.listFilterValues.filterMinWeight
      )
    );
    filterMinAndMaxValueInputsWeight.setMaxInput(
      ConvertNumberToInputString(
        listFiltersEquipment.listFilterValues.filterMaxWeight
      )
    );

    setFilterWeightRangeUnit(
      listFiltersEquipment.listFilterValues.filterWeightRangeUnit
    );

    setFilterWeightUnits(
      listFiltersEquipment.listFilterValues.filterWeightUnits
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFiltersEquipment.listFilterValues]);

  useEffect(() => {
    filterMinAndMaxValueInputsDistance.setMinInput(
      ConvertNumberToInputString(
        listFiltersDistance.listFilterValues.filterMinDistance
      )
    );
    filterMinAndMaxValueInputsDistance.setMaxInput(
      ConvertNumberToInputString(
        listFiltersDistance.listFilterValues.filterMaxDistance
      )
    );

    setFilterDistanceRangeUnit(
      listFiltersDistance.listFilterValues.filterDistanceRangeUnit
    );

    setFilterDistanceUnits(
      listFiltersDistance.listFilterValues.filterDistanceUnits
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFiltersDistance.listFilterValues]);

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
                    onPress={handleResetFilterButton}
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
