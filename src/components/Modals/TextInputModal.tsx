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

type TextInputModalProps = {
  textInputModal: UseDisclosureReturnType;
  label: string;
  header: string;
  sourceValue: string | null;
  buttonAction: (value: string) => void;
  buttonText?: string;
};

export const TextInputModal = ({
  textInputModal,
  label,
  header,
  sourceValue,
  buttonAction,
  buttonText = "Save",
}: TextInputModalProps) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue(sourceValue ?? "");
  }, [sourceValue]);

  const handleSaveButton = () => {
    buttonAction(value);

    resetInputs();
  };

  const resetInputs = () => {
    setValue("");
  };

  return (
    <Modal
      isOpen={textInputModal.isOpen}
      onOpenChange={textInputModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <div className="h-16">
                <Input
                  value={value}
                  label={label}
                  size="sm"
                  variant="faded"
                  onValueChange={setValue}
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSaveButton}>
                {buttonText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
