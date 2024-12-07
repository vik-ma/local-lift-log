import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import { UsePresetsListReturnType, UserSettings } from "../../typings";
import { NumberRangeInput, WeightUnitDropdown } from "..";
import { useNumberRangeInvalidityMap } from "../../hooks";

type FilterPresetListModalProps = {
  usePresetsList: UsePresetsListReturnType;
  userSettings: UserSettings;
};

export const FilterPresetListModal = ({
  usePresetsList,
  userSettings,
}: FilterPresetListModalProps) => {
  const { filterPresetListModal, listFilters, presetsType, presetsTypeString } =
    usePresetsList;

  const {
    filterWeightRange,
    setFilterWeightRange,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
  } = listFilters;

  const numberRangeInvalidityMap =
    useNumberRangeInvalidityMap(filterWeightRange);

  return (
    <Modal
      isOpen={filterPresetListModal.isOpen}
      onOpenChange={filterPresetListModal.onOpenChange}
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
                      filterPresetListModal
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
