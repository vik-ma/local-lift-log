import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
  Button,
} from "@heroui/react";
import {
  GroupedWorkoutSet,
  MultisetTypeMap,
  UseDisclosureReturnType,
} from "../../typings";
import {
  FormatNumItemsString,
  GenerateMultisetExerciseListText,
} from "../../helpers";

type GroupedWorkoutSetListModal = {
  groupedWorkoutSetListModal: UseDisclosureReturnType;
  operatingGroupedSet: GroupedWorkoutSet | undefined;
  groupedWorkoutSetList: GroupedWorkoutSet[];
  multisetTypeMap: MultisetTypeMap;
  onClickAction: (groupedWorkoutSet: GroupedWorkoutSet) => void;
};

export const GroupedWorkoutSetListModal = ({
  groupedWorkoutSetListModal,
  operatingGroupedSet,
  groupedWorkoutSetList,
  multisetTypeMap,
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
              <ScrollShadow className="max-h-[400px] flex flex-col gap-1">
                {groupedWorkoutSetList.map((groupedSet) => {
                  const isOperatingGroupedSet =
                    operatingGroupedSet?.id === groupedSet.id;

                  const header =
                    groupedSet.isMultiset &&
                    groupedSet.multiset !== undefined ? (
                      multisetTypeMap.get(groupedSet.multiset.multiset_type) ??
                      ""
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

                  const subHeader = groupedSet.isMultiset
                    ? GenerateMultisetExerciseListText(groupedSet.exerciseList)
                    : FormatNumItemsString(groupedSet.setList.length, "Set");

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
                      <span className="w-full truncate text-left">
                        {header}
                      </span>
                      <span className="w-full truncate text-left text-xs text-secondary ">
                        {subHeader}
                      </span>
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
