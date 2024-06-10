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
}: UserWeightModalProps) => {
  return (
    <Modal
      isOpen={userWeightModal.isOpen}
      onOpenChange={userWeightModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Body Weight Entry</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <Input
                    value={userWeightInput}
                    label="Weight"
                    size="sm"
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
                  />
                </div>
                <Input
                  value={commentInput}
                  label="Comment"
                  size="sm"
                  variant="faded"
                  onValueChange={(value) => setCommentInput(value)}
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="success"
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
