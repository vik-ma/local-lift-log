import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useExerciseList, useFilterExerciseList } from "../hooks";
import { useState } from "react";
import { ExerciseModalList, FilterExerciseGroupsModal } from "../components";

type ListType = "exercise";

export default function AnalyticsIndex() {
  const [listType, setListType] = useState<ListType>("exercise");

  const listModal = useDisclosure();

  const exerciseList = useExerciseList(true, true, true);

  const filterExerciseList = useFilterExerciseList(exerciseList);

  return (
    <>
      <Modal isOpen={listModal.isOpen} onOpenChange={listModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {listType === "exercise" ? "Select Exercise" : ""}
              </ModalHeader>
              <ModalBody>
                {listType === "exercise" ? (
                  <ExerciseModalList
                    handleClickExercise={() => {}}
                    exerciseList={exerciseList}
                    useFilterExerciseList={filterExerciseList}
                    userSettingsId={0}
                  />
                ) : (
                  <></>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="flat"
          color="secondary"
          onPress={() => listModal.onOpen()}
        >
          Select Exercise
        </Button>
      </div>
    </>
  );
}
