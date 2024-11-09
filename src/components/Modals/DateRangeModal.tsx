import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import { UseDisclosureReturnType } from "../../typings";

type DateRangeModalProps = {
  dateRangeModal: UseDisclosureReturnType;
  buttonAction: () => void;
};

export const DateRangeModal = ({
  dateRangeModal,
  buttonAction,
}: DateRangeModalProps) => {
  return (
    <Modal
      isOpen={dateRangeModal.isOpen}
      onOpenChange={dateRangeModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Select Date Range</ModalHeader>
            <ModalBody>
              <div className="h-16"></div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={() => buttonAction()}>
                Done
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
