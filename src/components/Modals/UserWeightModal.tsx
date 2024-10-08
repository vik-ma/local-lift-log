import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { WeightUnitDropdown } from "..";
import { UseDisclosureReturnType } from "../../typings";

type UserWeightModalProps = {
  userWeightModal: UseDisclosureReturnType;
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
            <ModalHeader>
              {isEditing ? "Edit" : "Add"} Body Weight Entry
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
