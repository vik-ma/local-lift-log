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
import { useMeasurementTypes } from "../../hooks/";

type MeasurementModalProps = {
  measurementModal: UseDisclosureReturnType;
  measurement: Measurement;
  setMeasurement: React.Dispatch<React.SetStateAction<Measurement>>;
  isMeasurementNameValid: boolean;
  handleMeasurementTypeChange: (measurementType: string) => void;
  buttonAction: () => void;
};

export const MeasurementModal = ({
  measurementModal,
  measurement,
  setMeasurement,
  isMeasurementNameValid,
  handleMeasurementTypeChange,
  buttonAction,
}: MeasurementModalProps) => {
  const measurementTypes = useMeasurementTypes();

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
                  value={measurement.name}
                  isInvalid={!isMeasurementNameValid}
                  label="Name"
                  errorMessage={
                    !isMeasurementNameValid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) =>
                    setMeasurement((prev) => ({
                      ...prev,
                      name: value,
                    }))
                  }
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
                  <div>
                    <MeasurementUnitDropdown
                      measurement={measurement}
                      isDisabled={
                        measurement.measurement_type === "Caliper"
                          ? true
                          : false
                      }
                      setMeasurement={setMeasurement}
                      targetType="modal"
                      showBigLabel
                    />
                  </div>
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
                onPress={buttonAction}
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
