import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import { UseDisclosureReturnType } from "../../typings";

type FilterWorkoutListModal = {
  filterWorkoutListModal: UseDisclosureReturnType;
  buttonAction: () => void;
};

export const FilterWorkoutListModal = ({
  filterWorkoutListModal,
  buttonAction,
}: FilterWorkoutListModal) => {
  return (
    <Modal
      isOpen={filterWorkoutListModal.isOpen}
      onOpenChange={filterWorkoutListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Workouts</ModalHeader>
            <ModalBody></ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={buttonAction}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
