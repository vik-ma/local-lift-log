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
import { useEffect, useState } from "react";
import { useValidateName } from "../../hooks";

type NameInputModalProps = {
  nameInputModal: UseDisclosureReturnType;
  name: string;
  header: string;
  buttonAction: (name: string) => void;
};

export const NameInputModal = ({
  nameInputModal,
  name,
  header,
  buttonAction,
}: NameInputModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");

  const isNameValid = useValidateName(nameInput);

  useEffect(() => {
    setNameInput(name ?? "");
  }, [name]);

  const handleSaveButton = () => {
    if (!isNameValid) return;

    buttonAction(nameInput);
  };

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
