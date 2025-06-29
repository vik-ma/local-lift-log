import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@heroui/react";
import { UseDisclosureReturnType } from "../../typings";

type OldSetWarningModalProps = {
  oldSetWarningModal: UseDisclosureReturnType;
};

export const OldSetWarningModal = ({
  oldSetWarningModal,
}: OldSetWarningModalProps) => {
  return (
    <Modal
      isOpen={oldSetWarningModal.isOpen}
      onOpenChange={oldSetWarningModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>TODO: FIX</ModalHeader>
            <ModalBody>
              <div className="h-16"></div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Cancel
              </Button>
              {/* TODO: FIX */}
              {/* <Button color="primary" onPress={handleSaveButton}>
                Add
              </Button> */}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
