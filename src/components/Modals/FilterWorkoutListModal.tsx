import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import { UseWorkoutListReturnType } from "../../typings";

type FilterWorkoutListModal = {
  useWorkoutList: UseWorkoutListReturnType;
};

export const FilterWorkoutListModal = ({
  useWorkoutList,
}: FilterWorkoutListModal) => {
  const { filterWorkoutListModal, handleFilterDoneButton } = useWorkoutList;

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
              <Button color="primary" onPress={handleFilterDoneButton}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
