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
import {
  EmptyListLabel,
  ListFilters,
  SearchInput,
  WorkoutTemplateListOptions,
} from "..";
import { useNavigate } from "react-router-dom";
import { GoToArrowIcon } from "../../assets";

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
    workoutTemplates,
    listFilters,
  } = workoutTemplateList;

  const { filterMap, removeFilter, prefixMap } = listFilters;

  const navigate = useNavigate();

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
                  filteredListLength={filteredWorkoutTemplates.length}
                  totalListLength={workoutTemplates.length}
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <Button
                      color="secondary"
                      size="sm"
                      variant="flat"
                      onPress={() => navigate("/workout-templates")}
                      endContent={<GoToArrowIcon />}
                    >
                      Edit Workout Templates
                    </Button>
                    <WorkoutTemplateListOptions
                      useWorkoutTemplateList={workoutTemplateList}
                    />
                  </div>
                  {filterMap.size > 0 && (
                    <ListFilters
                      filterMap={filterMap}
                      removeFilter={removeFilter}
                      prefixMap={prefixMap}
                    />
                  )}
                </div>
                <ScrollShadow className="flex flex-col gap-1">
                  {filteredWorkoutTemplates.map((template) => (
                    <button
                      className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                      key={template.id}
                      onClick={() => onClickAction(template)}
                    >
                      <span className="w-full truncate text-left">
                        {template.name}
                      </span>
                      {template.numSets! > 0 ? (
                        <span className="text-xs text-secondary text-left">
                          {FormatNumItemsString(
                            template.exerciseIdSet !== undefined
                              ? template.exerciseIdSet.size
                              : 0,
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
                  {filteredWorkoutTemplates.length === 0 && (
                    <EmptyListLabel itemName="Workout Templates" />
                  )}
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
