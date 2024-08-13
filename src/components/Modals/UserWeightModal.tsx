import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { WeightUnitDropdown } from "..";
import { useState } from "react";

type UserWeightModalProps = {
  userWeightModal: ReturnType<typeof useDisclosure>;
  userWeightInput: string;
  setUserWeightInput: React.Dispatch<React.SetStateAction<string>>;
  isWeightInputValid: boolean;
  weightUnit: string;
  setWeightUnit: React.Dispatch<React.SetStateAction<string>>;
  commentInput: string;
  setCommentInput: React.Dispatch<React.SetStateAction<string>>;
  buttonAction: () => void;
  isEditing: boolean;
  showErrorScreen?: boolean;
};

export const UserWeightModal = ({
  userWeightModal,
  userWeightInput,
  setUserWeightInput,
  isWeightInputValid,
  weightUnit,
  setWeightUnit,
  commentInput,
  setCommentInput,
  buttonAction,
  isEditing,
  showErrorScreen = false,
}: UserWeightModalProps) => {
  const [showError, setShowError] = useState<boolean>(showErrorScreen);

  return (
    <Modal
      isOpen={userWeightModal.isOpen}
      onOpenChange={userWeightModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {showError
                ? "No Body Weight Entry Found"
                : `${isEditing ? "Edit" : "Add"} Body Weight Entry`}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <Input
                    value={userWeightInput}
                    label="Weight"
                    variant="faded"
                    onValueChange={(value) => setUserWeightInput(value)}
                    isInvalid={!isWeightInputValid}
                    isRequired
                    isClearable
                  />
                  <WeightUnitDropdown
                    value={weightUnit}
                    setState={setWeightUnit}
                    targetType="state"
                    showLabel
                  />
                </div>
                <Input
                  value={commentInput}
                  label="Comment"
                  variant="faded"
                  onValueChange={(value) => setCommentInput(value)}
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={buttonAction}
                isDisabled={!isWeightInputValid}
              >
                {isEditing ? "Update" : "Add"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
