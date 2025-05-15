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

type PresetsModalProps = {
  presetsModal: UseDisclosureReturnType;
  operationType: PresetsOperationType;
  presetsType: PresetsType;
  nameInput: string;
  setNameInput: React.Dispatch<React.SetStateAction<string>>;
  isNameInputValid: boolean;
  valueInput: string;
  setValueInput: React.Dispatch<React.SetStateAction<string>>;
  isValueInputInvalid: boolean;
  operatingEquipmentWeight: EquipmentWeight;
  setOperatingEquipmentWeight: React.Dispatch<
    React.SetStateAction<EquipmentWeight>
  >;
  operatingDistance: Distance;
  setOperatingDistance: React.Dispatch<React.SetStateAction<Distance>>;
  isNewPresetInvalid: boolean;
  doneButtonAction: () => void;
};

export const PresetsModal = ({
  presetsModal,
  operationType,
  presetsType,
  nameInput,
  setNameInput,
  isNameInputValid,
  valueInput,
  setValueInput,
  isValueInputInvalid,
  operatingEquipmentWeight,
  setOperatingEquipmentWeight,
  operatingDistance,
  setOperatingDistance,
  isNewPresetInvalid,
  doneButtonAction,
}: PresetsModalProps) => {
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
                onPress={doneButtonAction}
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
