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
import { useState } from "react";
import { useValidateName } from "../../hooks";

type NameInputModalProps = {
  nameInputModal: UseDisclosureReturnType;
  header: string;
  buttonAction: (name: string) => void;
};

export const NameInputModal = ({
  nameInputModal,
  header,
  buttonAction,
}: NameInputModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");

  const isNameValid = useValidateName(nameInput);

  const handleSaveButton = () => {
    if (!isNameValid) return;

    buttonAction(nameInput);

    resetInputs();
  };

  const resetInputs = () => {
    setNameInput("");
  }

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
                  value={nameInput}
                  isInvalid={!isNameValid}
                  label="Name"
                  errorMessage={!isNameValid && "Name can't be empty"}
                  variant="faded"
                  onValueChange={setNameInput}
                  isRequired
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSaveButton}>
                Add
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
