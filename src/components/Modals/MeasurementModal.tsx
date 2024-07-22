import { MeasurementUnitDropdown } from "../";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { Measurement } from "../../typings";

type MeasurementModalProps = {
  measurementModal: ReturnType<typeof useDisclosure>;
  measurement: Measurement;
  setMeasurement: React.Dispatch<React.SetStateAction<Measurement>>;
  isMeasurementNameValid: boolean;
  handleMeasurementTypeChange: (measurementType: string) => void;
  buttonAction: () => void;
  isEditing: boolean;
};

export const MeasurementModal = ({
  measurementModal,
  measurement,
  setMeasurement,
  isMeasurementNameValid,
  handleMeasurementTypeChange,
  buttonAction,
  isEditing,
}: MeasurementModalProps) => {
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
                <div className="flex justify-around items-center px-1">
                  <RadioGroup
                    value={measurement.measurement_type}
                    onValueChange={(value) =>
                      handleMeasurementTypeChange(value)
                    }
                    label="Measurement Type"
                  >
                    <Radio value="Circumference">Circumference</Radio>
                    <Radio value="Caliper">Caliper</Radio>
                  </RadioGroup>
                  <MeasurementUnitDropdown
                    measurement={measurement}
                    isDisabled={
                      measurement.measurement_type === "Caliper" ? true : false
                    }
                    setMeasurement={setMeasurement}
                    targetType="modal"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="success"
                isDisabled={!isMeasurementNameValid}
                onPress={buttonAction}
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
