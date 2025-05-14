import { MeasurementUnitDropdown } from "../";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { Measurement, UseDisclosureReturnType } from "../../typings";
import { useMeasurementTypes, useValidateName } from "../../hooks/";
import { useEffect, useState } from "react";

type MeasurementModalProps = {
  measurementModal: UseDisclosureReturnType;
  measurement: Measurement;
  setMeasurement: React.Dispatch<React.SetStateAction<Measurement>>;
  handleMeasurementTypeChange: (measurementType: string) => void;
  buttonAction: () => void;
};

export const MeasurementModal = ({
  measurementModal,
  measurement,
  setMeasurement,
  handleMeasurementTypeChange,
  buttonAction,
}: MeasurementModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");

  const isMeasurementNameValid = useValidateName(nameInput);

  const measurementTypes = useMeasurementTypes();

  const handleSaveButton = () => {
    if (!isMeasurementNameValid) return;

    setMeasurement((prev) => ({
      ...prev,
      name: nameInput,
    }));

    buttonAction();
  };

  useEffect(() => {
    setNameInput(measurement.name);
  }, [measurement.name]);

  return (
    <Modal
      isOpen={measurementModal.isOpen}
      onOpenChange={measurementModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>New Measurement</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-0.5">
                <Input
                  className="h-[5rem]"
                  value={nameInput}
                  isInvalid={!isMeasurementNameValid}
                  label="Name"
                  errorMessage={
                    !isMeasurementNameValid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={setNameInput}
                  isRequired
                  isClearable
                />
                <div className="flex justify-around px-1">
                  <RadioGroup
                    value={measurement.measurement_type}
                    onValueChange={(value) =>
                      handleMeasurementTypeChange(value)
                    }
                    label="Measurement Type"
                  >
                    {measurementTypes.map((measurementType) => (
                      <Radio key={measurementType} value={measurementType}>
                        {measurementType}
                      </Radio>
                    ))}
                  </RadioGroup>
                  <MeasurementUnitDropdown
                    measurement={measurement}
                    isDisabled={
                      measurement.measurement_type === "Caliper" ? true : false
                    }
                    setMeasurement={setMeasurement}
                    targetType="modal"
                    showBigLabel
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                isDisabled={!isMeasurementNameValid}
                onPress={handleSaveButton}
              >
                {measurement.id !== 0 ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
