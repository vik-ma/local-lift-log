import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { PlateCalculation, UseDisclosureReturnType } from "../../typings";
import { useValidateName } from "../../hooks";

type PlateCalculationModalProps = {
  plateCalculationModal: UseDisclosureReturnType;
  plateCalculation: PlateCalculation;
  setPlateCalculation: React.Dispatch<React.SetStateAction<PlateCalculation>>;
  buttonAction: () => void;
};

export const PlateCalculationModal = ({
  plateCalculationModal,
  plateCalculation,
  setPlateCalculation,
  buttonAction,
}: PlateCalculationModalProps) => {
  const isNameInputValid = useValidateName(plateCalculation.name);

  return (
    <Modal
      isOpen={plateCalculationModal.isOpen}
      onOpenChange={plateCalculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {plateCalculation.id === 0 ? "New" : "Edit"} Plate Calculation
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-0.5">
                  <Input
                    className="h-[5rem]"
                    value={plateCalculation.name}
                    isInvalid={!isNameInputValid}
                    label="Name"
                    errorMessage={!isNameInputValid && "Name can't be empty"}
                    variant="faded"
                    onValueChange={(value) =>
                      setPlateCalculation((prev) => ({ ...prev, name: value }))
                    }
                    isRequired
                    isClearable
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
                onPress={buttonAction}
                isDisabled={!isNameInputValid}
              >
                {plateCalculation.id !== 0 ? "Save" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
