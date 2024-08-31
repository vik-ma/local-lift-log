import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
} from "@nextui-org/react";
import {
  UseWorkoutTemplateListReturnType,
  WorkoutTemplate,
} from "../../typings";
import { ReactNode } from "react";
import { FormatNumItemsString } from "../../helpers";
import { SearchInput } from "..";

type WorkoutTemplateListModalProps = {
  workoutTemplateList: UseWorkoutTemplateListReturnType;
  onClickAction: (workoutTemplate: WorkoutTemplate) => void;
  header: ReactNode;
};

export const WorkoutTemplateListModal = ({
  workoutTemplateList,
  onClickAction,
  header,
}: WorkoutTemplateListModalProps) => {
  const {
    workoutTemplatesModal,
    filteredWorkoutTemplates,
    filterQuery,
    setFilterQuery,
  } = workoutTemplateList;

  return (
    <Modal
      isOpen={workoutTemplatesModal.isOpen}
      onOpenChange={workoutTemplatesModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-2">
                <SearchInput
                  filterQuery={filterQuery}
                  setFilterQuery={setFilterQuery}
                />
                <ScrollShadow className="flex flex-col gap-1">
                  {filteredWorkoutTemplates.map((template) => (
                    <button
                      className="flex flex-col justify-start items-start gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                      key={template.id}
                      onClick={() => onClickAction(template)}
                    >
                      <span className="w-full truncate text-left">
                        {template.name}
                      </span>
                      {template.numSets! > 0 ? (
                        <span className="text-xs text-secondary text-left">
                          {FormatNumItemsString(
                            template.numExercises,
                            "Exercise"
                          )}
                          , {FormatNumItemsString(template.numSets, "Set")}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400 text-left">
                          Empty
                        </span>
                      )}
                      {template.note !== null && (
                        <span className="w-full break-all text-xs text-stone-500 text-left">
                          {template.note}
                        </span>
                      )}
                    </button>
                  ))}
                </ScrollShadow>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
