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
} from "../../typings";
import { useValidateName } from "../../hooks";

type PlateCalculationModalProps = {
  plateCalculationModal: UsePlateCalculationModalReturnType;
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

  const changePlateCalculatorPage = () => {
    if (plateCalculationModal.plateCalculatorPage === "base") {
      plateCalculationModal.setPlateCalculatorPage("equipment-list");
    } else {
      plateCalculationModal.setPlateCalculatorPage("base");
    }
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
              {plateCalculationModal.plateCalculatorPage === "base" ? (
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
                <div>test</div>
              )}
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
