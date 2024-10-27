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
  PlateCalculation,
  UsePlateCalculationModalReturnType,
  UsePresetsListReturnType,
} from "../../typings";
import { useValidateName } from "../../hooks";
import { PresetsModalList } from "../PresetsModalList";
import { useState } from "react";

type PlateCalculationModalProps = {
  usePlateCalculationModal: UsePlateCalculationModalReturnType;
  plateCalculation: PlateCalculation;
  setPlateCalculation: React.Dispatch<React.SetStateAction<PlateCalculation>>;
  usePresetsList: UsePresetsListReturnType;
  buttonAction: () => void;
};

type OperationType = "set-handle" | "set-plates";

export const PlateCalculationModal = ({
  usePlateCalculationModal,
  plateCalculation,
  setPlateCalculation,
  usePresetsList,
  buttonAction,
}: PlateCalculationModalProps) => {
  const [operationType, setOperationType] =
    useState<OperationType>("set-handle");

  const isNameInputValid = useValidateName(plateCalculation.name);

  const { sortCategoryEquipment, handleSortOptionSelectionEquipment } =
    usePresetsList;

  const { plateCalculationModal, plateCalculatorPage, setPlateCalculatorPage } =
    usePlateCalculationModal;

  const handleSetHandleButton = () => {
    if (sortCategoryEquipment !== "favorite") {
      handleSortOptionSelectionEquipment("favorite");
    }
    setOperationType("set-handle");
    setPlateCalculatorPage("equipment-list");
  };

  const handleSetAvailablePlatesButton = () => {
    setOperationType("set-plates");
    handleSortOptionSelectionEquipment("plate-calc");
    setPlateCalculatorPage("equipment-list");
  };

  const handleBackButton = () => {
    setOperationType("set-handle");
    setPlateCalculatorPage("base");
  };

  return (
    <Modal
      isOpen={plateCalculationModal.isOpen}
      onOpenChange={plateCalculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {plateCalculatorPage === "equipment-list"
                ? "Select Available Plates"
                : plateCalculation.id === 0
                ? "New Plate Calculation"
                : "Edit Plate Calculation"}
            </ModalHeader>
            <ModalBody>
              <div className="h-[440px]">
                {plateCalculatorPage === "base" ? (
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
                  <PresetsModalList
                    presetsList={usePresetsList}
                    handlePresetClick={() => {}}
                    showSortButton
                    heightString="h-[450px]"
                    validWeightUnit={plateCalculation.weight_unit}
                    showPlateCalculatorButton={operationType === "set-plates"}
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  className="w-[11rem]"
                  color={
                    plateCalculatorPage === "base" ? "secondary" : "default"
                  }
                  variant="flat"
                  onPress={
                    plateCalculatorPage === "base"
                      ? handleSetAvailablePlatesButton
                      : handleBackButton
                  }
                >
                  {plateCalculatorPage === "base"
                    ? "Set Available Weights"
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
