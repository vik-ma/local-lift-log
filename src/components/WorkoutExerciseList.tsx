import { Reorder } from "framer-motion";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { SetList } from ".";
import { VerticalMenuIcon, ChevronIcon } from "../assets";
import {
  GroupedWorkoutSet,
  SetListNotes,
  WorkoutSet,
  SetListOptionsItem,
  Exercise,
} from "../typings";

type WorkoutExerciseListProps = {
  groupedSets: GroupedWorkoutSet[];
  setGroupedSets: React.Dispatch<React.SetStateAction<GroupedWorkoutSet[]>>;
  updateExerciseOrder: (setList?: GroupedWorkoutSet[]) => void;
  handleExerciseAccordionClick: (groupedSet: GroupedWorkoutSet) => void;
  handleExerciseOptionSelection: (
    key: string,
    groupedWorkoutSet: GroupedWorkoutSet
  ) => void;
  handleClickSet: (set: WorkoutSet, index: number, exercise: Exercise) => void;
  handleSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    index: number,
    exercise: Exercise
  ) => void;
  updateShownSetListComments: (exerciseId: number, index: number) => void;
  shownSetListComments: SetListNotes;
  setListOptionsMenu: SetListOptionsItem[];
  handleAddSetButton: () => void;
  setIsExerciseBeingDragged: React.Dispatch<React.SetStateAction<boolean>>;
  handleReassignExercise: (groupedWorkoutSet: GroupedWorkoutSet) => void;
  isTemplate: boolean;
  activeSetId?: number;
};

export const WorkoutExerciseList = ({
  groupedSets,
  setGroupedSets,
  updateExerciseOrder,
  handleExerciseAccordionClick,
  handleExerciseOptionSelection,
  handleClickSet,
  handleSetOptionSelection,
  updateShownSetListComments,
  shownSetListComments,
  setListOptionsMenu,
  handleAddSetButton,
  setIsExerciseBeingDragged,
  handleReassignExercise,
  isTemplate,
  activeSetId = 0,
}: WorkoutExerciseListProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="px-0.5">
        <h2 className="text-xl font-semibold flex items-baseline justify-between">
          Set List{" "}
          {groupedSets.length > 1 && (
            <span className="text-xs italic text-stone-500 font-normal">
              Drag Exercises To Reorder Set List
            </span>
          )}
        </h2>
      </div>
      <div className="flex flex-col">
        <Reorder.Group
          className="flex flex-col gap-1.5"
          values={groupedSets}
          onReorder={setGroupedSets}
        >
          {groupedSets.map((groupedSet) => (
            <Reorder.Item
              key={groupedSet.exercise.id}
              value={groupedSet}
              onDragStart={() => setIsExerciseBeingDragged(true)}
              onDragEnd={() => updateExerciseOrder()}
              transition={{ duration: 0.15 }}
            >
              <div className="bg-white rounded-lg border border-stone-300 overflow-hidden">
                <div
                  className="flex justify-between pl-2 py-1 h-14 w-full rounded-lg cursor-pointer hover:bg-stone-100"
                  onClick={() => handleExerciseAccordionClick(groupedSet)}
                >
                  <div className="flex flex-col items-start">
                    <div className="flex gap-3">
                      <h3
                        className={
                          groupedSet.exercise.isInvalid
                            ? "text-lg font-medium truncate max-w-80 text-red-500"
                            : "text-lg font-medium truncate max-w-80 text-yellow-600"
                        }
                      >
                        {groupedSet.exercise.name}
                      </h3>
                      {groupedSet.exercise.isInvalid && (
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => handleReassignExercise(groupedSet)}
                        >
                          Reassign Exercise
                        </Button>
                      )}
                    </div>
                    <span className="text-sm text-stone-500">
                      {groupedSet.setList.length} Sets
                    </span>
                  </div>
                  <div className="flex gap-0.5 px-0.5 items-center">
                    <ChevronIcon
                      size={27}
                      color="#a8a29e"
                      direction={groupedSet.isExpanded ? "down" : "left"}
                    />
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          className="z-1"
                          size="sm"
                          variant="light"
                        >
                          <VerticalMenuIcon color="#a8a29e" size={17} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label={`Option Menu For ${groupedSet.exercise.name}`}
                        itemClasses={{
                          base: "hover:text-[#404040] gap-4",
                        }}
                        onAction={(key) =>
                          handleExerciseOptionSelection(
                            key as string,
                            groupedSet
                          )
                        }
                      >
                        <DropdownItem key="add-set-to-exercise">
                          Add Set
                        </DropdownItem>
                        <DropdownItem
                          className={
                            groupedSet.exercise.note === null ? "hidden" : ""
                          }
                          key="toggle-exercise-note"
                        >
                          {groupedSet.showExerciseNote
                            ? "Hide Exercise Note"
                            : "Show Exercise Note"}
                        </DropdownItem>
                        {groupedSet.exercise.isInvalid ? (
                          <DropdownItem key="reassign-exercise">
                            Reassign Exercise
                          </DropdownItem>
                        ) : (
                          <DropdownItem key="change-exercise">
                            Change Exercise
                          </DropdownItem>
                        )}
                        <DropdownItem
                          className="text-danger"
                          key="delete-exercise-sets"
                        >
                          Remove All Sets
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
                {groupedSet.isExpanded && (
                  <div className="flex flex-col divide-y divide-stone-200">
                    {groupedSet.showExerciseNote && (
                      <div className="flex justify-between items-center px-2 pb-1">
                        <span className="text-stone-400 break-words max-w-full">
                          {groupedSet.exercise.note}
                        </span>
                      </div>
                    )}
                    <SetList
                      groupedSet={groupedSet}
                      activeSetId={activeSetId}
                      clickSetAction={handleClickSet}
                      optionsSelectionAction={handleSetOptionSelection}
                      clickCommentButtonAction={updateShownSetListComments}
                      shownSetListComments={shownSetListComments}
                      isTemplate={isTemplate}
                      setListOptionsMenu={setListOptionsMenu}
                    />
                  </div>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      <div className="flex justify-center">
        <Button color="success" onPress={handleAddSetButton}>
          Add Set
        </Button>
      </div>
    </div>
  );
};
