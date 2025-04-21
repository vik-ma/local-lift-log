import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@heroui/react";
import { ReactNode } from "react";
import { UseDisclosureReturnType } from "../../typings";

type DeleteModalProps = {
  deleteModal: UseDisclosureReturnType;
  header: string;
  body: ReactNode;
  deleteButtonAction: () => void;
  deleteButtonText?: string;
};

export const DeleteModal = ({
  deleteModal,
  header,
  body,
  deleteButtonAction,
  deleteButtonText = "Delete",
}: DeleteModalProps) => {
  return (
    <Modal isOpen={deleteModal.isOpen} onOpenChange={deleteModal.onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>{body}</ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="danger" onPress={() => deleteButtonAction()}>
                {deleteButtonText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteModal;
