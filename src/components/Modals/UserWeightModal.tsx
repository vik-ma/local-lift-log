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
import WeightUnitDropdown from "../Dropdowns/WeightUnitDropdown";
import { UserWeight } from "../../typings";

type UserWeightModalProps = {
  userWeightModal: ReturnType<typeof useDisclosure>;
  userWeightInput: string;
  setUserWeightInput: React.Dispatch<React.SetStateAction<string>>;
  isWeightInputValid: boolean;
  operatingUserWeight: UserWeight;
  setOperatingUserWeight: React.Dispatch<React.SetStateAction<UserWeight>>;
  commentInput: string;
  setCommentInput: React.Dispatch<React.SetStateAction<string>>;
  updateUserWeight: () => void;
};

export const UserWeightModal = ({
  userWeightModal,
  userWeightInput,
  setUserWeightInput,
  isWeightInputValid,
  operatingUserWeight,
  setOperatingUserWeight,
  commentInput,
  setCommentInput,
  updateUserWeight,
}: UserWeightModalProps) => {
  return (
    <Modal
      isOpen={userWeightModal.isOpen}
      onOpenChange={userWeightModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Body Weight Record</ModalHeader>
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
                    isClearable
                  />
                  <WeightUnitDropdown
                    value={operatingUserWeight.weight_unit}
                    setUserWeight={setOperatingUserWeight}
                    targetType="weight"
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
                onPress={updateUserWeight}
                isDisabled={!isWeightInputValid}
              >
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
