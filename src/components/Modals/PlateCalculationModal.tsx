import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import {
  EquipmentWeight,
  PlateCalculation,
  UsePlateCalculationModalReturnType,
  UsePresetsListReturnType,
} from "../../typings";
import { useValidateName } from "../../hooks";
import { PresetsModalList } from "../PresetsModalList";
import { GenerateFormattedAvailablePlatesString } from "../../helpers";

type PlateCalculationModalProps = {
  plateCalculationModal: UsePlateCalculationModalReturnType;
  plateCalculation: PlateCalculation;
  setPlateCalculation: React.Dispatch<React.SetStateAction<PlateCalculation>>;
  presetsList: UsePresetsListReturnType;
  buttonAction: () => void;
};

export const PlateCalculationModal = ({
  plateCalculationModal,
  plateCalculation,
  setPlateCalculation,
  presetsList,
  buttonAction,
}: PlateCalculationModalProps) => {
  const isNameInputValid = useValidateName(plateCalculation.name);

  const { operatingPlateCalculation, setOperatingPlateCalculation } =
    presetsList;

  const changePlateCalculatorPage = () => {
    if (plateCalculationModal.plateCalculatorPage === "base") {
      plateCalculationModal.setPlateCalculatorPage("equipment-list");
    } else {
      plateCalculationModal.setPlateCalculatorPage("base");
    }
  };

  const updateAvailablePlatesMap = (equipmentWeight: EquipmentWeight) => {
    if (operatingPlateCalculation.availablePlatesMap === undefined) return;

    const updatedAvailablePlatesMap = new Map(
      operatingPlateCalculation.availablePlatesMap
    );

    if (updatedAvailablePlatesMap.has(equipmentWeight)) {
      updatedAvailablePlatesMap.delete(equipmentWeight);
    } else {
      updatedAvailablePlatesMap.set(equipmentWeight, 12);
    }

    const {
      available_plates_string,
      formattedAvailablePlatesString,
      formattedAvailablePlatesMapString,
    } = GenerateFormattedAvailablePlatesString(updatedAvailablePlatesMap);

    const updatedPlateCalculation = {
      ...operatingPlateCalculation,
      available_plates_string,
      availablePlatesMap: updatedAvailablePlatesMap,
      formattedAvailablePlatesString,
      formattedAvailablePlatesMapString,
    };

    setOperatingPlateCalculation(updatedPlateCalculation);
  };

  return (
    <Modal
      isOpen={plateCalculationModal.plateCalculationModal.isOpen}
      onOpenChange={plateCalculationModal.plateCalculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {plateCalculation.id === 0 ? "New" : "Edit"} Plate Calculation
            </ModalHeader>
            <ModalBody>
              <div className="h-[450px]">
                {plateCalculationModal.plateCalculatorPage === "base" ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-0.5">
                      <Input
                        className="h-[5rem]"
                        value={plateCalculation.name}
                        isInvalid={!isNameInputValid}
                        label="Name"
                        errorMessage={
                          !isNameInputValid && "Name can't be empty"
                        }
                        variant="faded"
                        onValueChange={(value) =>
                          setPlateCalculation((prev) => ({
                            ...prev,
                            name: value,
                          }))
                        }
                        isRequired
                        isClearable
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <PresetsModalList
                      presetsList={presetsList}
                      handlePresetClick={() => {}}
                      showSortButton
                      heightString="h-[410px]"
                      validWeightUnit={plateCalculation.weight_unit}
                      updateAvailablePlatesMap={updateAvailablePlatesMap}
                    />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  className="w-[7rem]"
                  color="secondary"
                  variant="flat"
                  onPress={changePlateCalculatorPage}
                >
                  {plateCalculationModal.plateCalculatorPage === "base"
                    ? "Add Weight"
                    : "Back"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={buttonAction}
                  isDisabled={!isNameInputValid}
                >
                  {plateCalculation.id !== 0 ? "Save" : "Create"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
