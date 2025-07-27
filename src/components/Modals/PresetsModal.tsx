import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { DistanceUnitDropdown, WeightUnitDropdown } from "..";
import {
  Distance,
  EquipmentWeight,
  PresetsOperationType,
  PresetsType,
  UseDisclosureReturnType,
} from "../../typings";
import { useEffect, useMemo, useState } from "react";
import { useValidateName } from "../../hooks";
import {
  ConvertNumberToInputString,
  ConvertNumberToTwoDecimals,
  IsStringInvalidNumber,
} from "../../helpers";

type PresetsModalProps = {
  presetsModal: UseDisclosureReturnType;
  operationType: PresetsOperationType;
  presetsType: PresetsType;
  operatingEquipmentWeight: EquipmentWeight;
  setOperatingEquipmentWeight: React.Dispatch<
    React.SetStateAction<EquipmentWeight>
  >;
  operatingDistance: Distance;
  setOperatingDistance: React.Dispatch<React.SetStateAction<Distance>>;
  doneButtonAction: (
    equipmentWeight?: EquipmentWeight,
    distance?: Distance
  ) => void;
};

export const PresetsModal = ({
  presetsModal,
  operationType,
  presetsType,
  operatingEquipmentWeight,
  setOperatingEquipmentWeight,
  operatingDistance,
  setOperatingDistance,
  doneButtonAction,
}: PresetsModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");

  const isNameInputValid = useValidateName({ name: nameInput });

  const isValueInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(valueInput, 0, true);
  }, [valueInput]);

  const isNewPresetInvalid = useMemo(() => {
    if (!isNameInputValid) return true;
    if (isValueInputInvalid) return true;
    return false;
  }, [isNameInputValid, isValueInputInvalid]);

  useEffect(() => {
    setNameInput(operatingEquipmentWeight.name);
    setValueInput(ConvertNumberToInputString(operatingEquipmentWeight.weight));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingEquipmentWeight.id]);

  useEffect(() => {
    setNameInput(operatingDistance.name);
    setValueInput(ConvertNumberToInputString(operatingDistance.distance));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingDistance.id]);

  const handleSaveButton = async () => {
    if (isNewPresetInvalid) return;

    if (presetsType === "equipment") {
      const weight = ConvertNumberToTwoDecimals(Number(valueInput));

      const equipmentWeight = {
        ...operatingEquipmentWeight,
        name: nameInput,
        weight: weight,
      };

      doneButtonAction(equipmentWeight);
    } else {
      const distanceValue = ConvertNumberToTwoDecimals(Number(valueInput));

      const distance = {
        ...operatingDistance,
        name: nameInput,
        distance: distanceValue,
      };

      doneButtonAction(undefined, distance);
    }

    resetInputs();
  };

  const resetInputs = () => {
    setNameInput("");
    setValueInput("");
  };

  return (
    <Modal
      isOpen={presetsModal.isOpen}
      onOpenChange={presetsModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {operationType === "edit" ? "Edit" : "New"}{" "}
              {presetsType === "equipment" ? "Equipment Weight" : "Distance"}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-0.5">
                <Input
                  className="h-[5rem]"
                  value={nameInput}
                  isInvalid={!isNameInputValid}
                  label="Name"
                  errorMessage={!isNameInputValid && "Name can't be empty"}
                  variant="faded"
                  onValueChange={(value) => setNameInput(value)}
                  isRequired
                  isClearable
                />
                <div className="flex justify-between gap-2 items-center">
                  <Input
                    value={valueInput}
                    label={presetsType === "equipment" ? "Weight" : "Distance"}
                    variant="faded"
                    onValueChange={(value) => setValueInput(value)}
                    isInvalid={isValueInputInvalid}
                    isRequired
                    isClearable
                  />
                  {presetsType === "equipment" ? (
                    <WeightUnitDropdown
                      value={operatingEquipmentWeight.weight_unit}
                      setEquipmentWeight={setOperatingEquipmentWeight}
                      targetType="equipment"
                      showLabel
                    />
                  ) : (
                    <DistanceUnitDropdown
                      value={operatingDistance.distance_unit}
                      setDistance={setOperatingDistance}
                      targetType="distance"
                      showLabel
                    />
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={handleSaveButton}
                isDisabled={isNewPresetInvalid}
              >
                {operationType === "edit" ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
