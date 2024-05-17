import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { ReactNode } from "react";

type DeleteModalProps = {
  deleteModal: ReturnType<typeof useDisclosure>;
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
              <Button color="danger" onPress={deleteButtonAction}>
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
