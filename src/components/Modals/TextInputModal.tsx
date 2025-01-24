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

type TextInputModalProps = {
  textInputModal: UseDisclosureReturnType;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  label: string;
  header: string;
  buttonAction: () => void;
  buttonText?: string;
};

export const TextInputModal = ({
  textInputModal,
  value,
  setValue,
  label,
  header,
  buttonAction,
  buttonText = "Save",
}: TextInputModalProps) => {
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
                  onValueChange={(value) => setValue(value)}
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={() => buttonAction()}>
                {buttonText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
