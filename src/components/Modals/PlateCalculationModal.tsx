import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
} from "@nextui-org/react";
import {
  EquipmentWeight,
  PlateCalculation,
  UsePlateCalculationModalReturnType,
  UsePresetsListReturnType,
} from "../../typings";
import { useValidateName } from "../../hooks";
import { useMemo, useState } from "react";
import {
  AvailablePlatesDropdown,
  PlateCalculationHandleConfig,
  PresetsModalList,
  WeightUnitDropdown,
} from "..";
import { CrossCircleIcon } from "../../assets";

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

  const {
    sortCategoryEquipment,
    handleSortOptionSelectionEquipment,
    otherUnitPlateCalculation,
    setOtherUnitPlateCalculation,
  } = usePresetsList;

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

  const setHandle = (equipment?: EquipmentWeight) => {
    if (equipment === undefined) return;

    const updatedPlateCalculation: PlateCalculation = {
      ...plateCalculation,
      handle: equipment,
    };

    setPlateCalculation(updatedPlateCalculation);

    setPlateCalculatorPage("base");
    setOperationType("set-handle");
  };

  const switchWeightUnit = () => {
    setOtherUnitPlateCalculation(plateCalculation);
    setPlateCalculation(otherUnitPlateCalculation);
  };

  const disableDoneButton = useMemo(() => {
    if (!isNameInputValid) return true;
    if (plateCalculation.handle === undefined) return true;
    if (plateCalculation.availablePlatesMap === undefined) return true;
    if (plateCalculation.availablePlatesMap.size === 0) return true;
    return false;
  }, [isNameInputValid, plateCalculation]);

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
                  <div className="flex flex-col gap-2.5">
                    <div className="flex gap-2.5 items-start">
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
                      <WeightUnitDropdown
                        value={plateCalculation.weight_unit}
                        targetType="plate-calculation"
                        setPlateCalculation={setPlateCalculation}
                        showLabel
                        switchWeightUnit={switchWeightUnit}
                      />
                    </div>
                    <PlateCalculationHandleConfig
                      plateCalculation={plateCalculation}
                      setPlateCalculation={setPlateCalculation}
                      handleSetHandleButton={handleSetHandleButton}
                    />
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-lg font-medium pl-0.5">
                        Available Plates
                      </h3>
                      <ScrollShadow className="flex flex-col gap-1 h-[250px]">
                        {Array.from(
                          plateCalculation.availablePlatesMap!.entries()
                        ).map(([key, value]) => (
                          <div
                            key={`plate-${key.id}`}
                            className="flex gap-1.5 items-center"
                          >
                            <div
                              className="flex pl-1.5 py-0.5 bg-default-50 border-2 border-default-200 rounded-lg hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                              onClick={() => {}}
                            >
                              <div className="flex gap-1 w-[17.5rem] text-secondary">
                                <span className="truncate max-w-[5rem]">
                                  {key.weight}
                                </span>
                                <span>{key.weight_unit}</span>
                              </div>
                            </div>
                            <AvailablePlatesDropdown
                              value={value}
                              equipmentWeight={key}
                              operatingPlateCalculation={plateCalculation}
                              setOperatingPlateCalculation={setPlateCalculation}
                              isSmall
                            />
                            <Button
                              aria-label={`Remove ${key.name} From Available Plates`}
                              size="sm"
                              color="danger"
                              isIconOnly
                              variant="light"
                              onPress={() => {}}
                            >
                              <CrossCircleIcon size={22} />
                            </Button>
                          </div>
                        ))}
                      </ScrollShadow>
                    </div>
                  </div>
                ) : (
                  <PresetsModalList
                    presetsList={usePresetsList}
                    handlePresetClick={
                      operationType === "set-handle" ? setHandle : () => {}
                    }
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
                  isDisabled={disableDoneButton}
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
