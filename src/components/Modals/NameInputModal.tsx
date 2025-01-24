import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Input,
} from "@heroui/react";
import { UseDisclosureReturnType } from "../../typings";

type NameInputModalProps = {
  nameInputModal: UseDisclosureReturnType;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  header: string;
  isNameValid: boolean;
  buttonAction: () => void;
};

export const NameInputModal = ({
  nameInputModal,
  name,
  setName,
  header,
  isNameValid,
  buttonAction,
}: NameInputModalProps) => {
  return (
    <Modal
      isOpen={nameInputModal.isOpen}
      onOpenChange={nameInputModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <div className="h-16">
                <Input
                  value={name}
                  isInvalid={!isNameValid}
                  label="Name"
                  errorMessage={!isNameValid && "Name can't be empty"}
                  variant="faded"
                  onValueChange={(value) => setName(value)}
                  isRequired
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={() => buttonAction()}>
                Add
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
