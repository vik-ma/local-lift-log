import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
  Button,
} from "@nextui-org/react";
import { GroupedWorkoutSet, UseDisclosureReturnType } from "../../typings";
import { GenerateMultisetExerciseListText } from "../../helpers";

type GroupedWorkoutSetListModal = {
  groupedWorkoutSetListModal: UseDisclosureReturnType;
  operatingGroupedSet: GroupedWorkoutSet | undefined;
  groupedWorkoutSetList: GroupedWorkoutSet[];
  onClickAction: (groupedWorkoutSet: GroupedWorkoutSet) => void;
};

export const GroupedWorkoutSetListModal = ({
  groupedWorkoutSetListModal,
  operatingGroupedSet,
  groupedWorkoutSetList,
  onClickAction,
}: GroupedWorkoutSetListModal) => {
  return (
    <Modal
      isOpen={groupedWorkoutSetListModal.isOpen}
      onOpenChange={groupedWorkoutSetListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Select Exercise Or Multiset To Merge Into</ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[400px] flex flex-col gap-1">
                {groupedWorkoutSetList.map((groupedSet) => {
                  const isOperatingGroupedSet =
                    operatingGroupedSet?.id === groupedSet.id;

                  const name = groupedSet.isMultiset ? (
                    GenerateMultisetExerciseListText(groupedSet.exerciseList)
                  ) : (
                    <span
                      className={
                        groupedSet.exerciseList[0].isInvalid
                          ? "text-red-700"
                          : ""
                      }
                    >
                      {groupedSet.exerciseList[0].name}
                    </span>
                  );

                  return (
                    <button
                      className={
                        isOperatingGroupedSet
                          ? "hidden"
                          : "flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:border-default-400"
                      }
                      key={groupedSet.id}
                      onClick={() => onClickAction(groupedSet)}
                    >
                      <span className="w-full truncate text-left">{name}</span>
                    </button>
                  );
                })}
              </ScrollShadow>
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
  );
};
