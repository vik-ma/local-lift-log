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
import {
  UseDisclosureReturnType,
  UseUserWeightInputsReturnType,
} from "../../typings";

type UserWeightModalProps = {
  userWeightModal: UseDisclosureReturnType;
  userWeightInputs: UseUserWeightInputsReturnType;
  buttonAction: () => void;
  isEditing: boolean;
};

export const UserWeightModal = ({
  userWeightModal,
  userWeightInputs,
  buttonAction,
  isEditing,
}: UserWeightModalProps) => {
  const {
    userWeightInput,
    setUserWeightInput,
    weightUnit,
    setWeightUnit,
    commentInput,
    setCommentInput,
    bodyFatPercentageInput,
    setBodyFatPercentageInput,
    isWeightInputValid,
    isBodyFatPercentageInputValid,
    isUserWeightValid,
  } = userWeightInputs;

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
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1.5 items-center">
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
                    showLabel
                    isSmall
                  />
                </div>
                <Input
                  value={bodyFatPercentageInput}
                  label="Body Fat %"
                  size="sm"
                  variant="faded"
                  onValueChange={(value) => setBodyFatPercentageInput(value)}
                  isInvalid={!isBodyFatPercentageInputValid}
                  isClearable
                />
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
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={buttonAction}
                isDisabled={!isUserWeightValid}
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
