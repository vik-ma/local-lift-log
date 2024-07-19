import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";

type TextInputModalProps = {
  textInputModal: ReturnType<typeof useDisclosure>;
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
                  variant="faded"
                  onValueChange={(value) => setValue(value)}
                  isRequired
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="success" onPress={() => buttonAction()}>
                {buttonText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
