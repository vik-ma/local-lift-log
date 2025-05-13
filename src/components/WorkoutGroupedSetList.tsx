import { Reorder } from "framer-motion";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { SetList } from ".";
import { VerticalMenuIcon, ChevronIcon } from "../assets";
import {
  GroupedWorkoutSet,
  SetListNotes,
  WorkoutSet,
  Exercise,
  MultisetTypeMap,
} from "../typings";
import { FormatNumItemsString, FormatSetsCompletedString } from "../helpers";

type WorkoutGroupedSetListProps = {
  groupedSets: GroupedWorkoutSet[];
  setGroupedSets: React.Dispatch<React.SetStateAction<GroupedWorkoutSet[]>>;
  updateExerciseOrder: (setList?: GroupedWorkoutSet[]) => void;
  handleGroupedSetAccordionClick: (groupedSet: GroupedWorkoutSet) => void;
  handleGroupedSetOptionSelection: (
    key: string,
    groupedWorkoutSet: GroupedWorkoutSet
  ) => void;
  handleClickSet: (
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => void;
  handleSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => void;
  updateShownSetListComments: (groupedSetId: string, index: number) => void;
  shownSetListComments: SetListNotes;
  handleAddSetButton: () => void;
  handleAddSetMultisetButton: () => void;
  setIsExerciseBeingDragged: React.Dispatch<React.SetStateAction<boolean>>;
  handleReassignExercise: (groupedWorkoutSet: GroupedWorkoutSet) => void;
  isTemplate: boolean;
  activeSetId?: number;
  completedSetsMap?: Map<string, number>;
  multisetTypeMap: MultisetTypeMap;
  handleToggleSetCommentButton: (
    set: WorkoutSet,
    index: number,
    groupedSet: GroupedWorkoutSet
  ) => void;
};

export const WorkoutGroupedSetList = ({
  groupedSets,
  setGroupedSets,
  updateExerciseOrder,
  handleGroupedSetAccordionClick,
  handleGroupedSetOptionSelection,
  handleClickSet,
  handleSetOptionSelection,
  updateShownSetListComments,
  shownSetListComments,
  handleAddSetButton,
  handleAddSetMultisetButton,
  setIsExerciseBeingDragged,
  handleReassignExercise,
  isTemplate,
  activeSetId = 0,
  completedSetsMap,
  multisetTypeMap,
  handleToggleSetCommentButton,
}: WorkoutGroupedSetListProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-center gap-1.5">
        <Button size="sm" onPress={handleAddSetButton}>
          Add Exercise
        </Button>
        <Button size="sm" onPress={handleAddSetMultisetButton}>
          Add Multiset
        </Button>
      </div>
      <div className="flex justify-between gap-3.5 items-end">
        <div className="flex flex-grow justify-between items-baseline px-0.5">
          <h2 className="text-xl font-semibold flex justify-between">
            Set List
          </h2>
          {groupedSets.length > 1 && (
            <span className="text-xs text-stone-500 font-normal">
              Drag Exercises To Reorder Set List
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <Reorder.Group
          className="flex flex-col gap-1.5"
          values={groupedSets}
          onReorder={setGroupedSets}
        >
          {groupedSets.map((groupedSet) => {
            const isMultiset = groupedSet.isMultiset ? true : false;

            const isExerciseInvalid =
              !groupedSet.isMultiset && groupedSet.exerciseList[0].isInvalid;

            const hasNote = isMultiset
              ? groupedSet.multiset?.note !== null
              : groupedSet.exerciseList[0].note !== null;

            const title = isMultiset
              ? multisetTypeMap.get(groupedSet.multiset!.multiset_type)
              : groupedSet.exerciseList[0].name;

            return (
              <Reorder.Item
                key={groupedSet.id}
                value={groupedSet}
                onDragStart={() => setIsExerciseBeingDragged(true)}
                onDragEnd={() => updateExerciseOrder()}
                transition={{ duration: 0.15 }}
              >
                <div className="bg-white rounded-lg border border-stone-300 overflow-hidden">
                  <div
                    className="flex justify-between pl-2 py-1 cursor-pointer hover:bg-stone-100"
                    onClick={() => handleGroupedSetAccordionClick(groupedSet)}
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <h3
                          className={
                            isExerciseInvalid
                              ? "text-lg font-medium truncate max-w-80 text-red-700"
                              : "text-lg font-medium truncate max-w-80 text-secondary"
                          }
                        >
                          {title}
                        </h3>
                        {isExerciseInvalid && (
                          <Button
                            className="h-7"
                            size="sm"
                            variant="flat"
                            onPress={() => handleReassignExercise(groupedSet)}
                          >
                            Reassign Exercise
                          </Button>
                        )}
                      </div>
                      <span
                        className={
                          completedSetsMap?.get(groupedSet.id) ===
                          groupedSet.setList.length
                            ? "text-sm text-secondary"
                            : "text-sm text-stone-500"
                        }
                      >
                        {completedSetsMap
                          ? `${completedSetsMap.get(
                              groupedSet.id
                            )}/${FormatSetsCompletedString(
                              groupedSet.setList.length
                            )}`
                          : `${FormatNumItemsString(
                              groupedSet.setList.length,
                              "Set"
                            )}`}
                      </span>
                    </div>
                    <div className="flex gap-0.5 px-0.5 items-center">
                      <ChevronIcon
                        size={27}
                        color="#a8a29e"
                        direction={groupedSet.isExpanded ? "down" : "left"}
                      />
                      <Dropdown shouldBlockScroll={false}>
                        <DropdownTrigger>
                          <Button
                            aria-label={`Toggle ${title} Options Menu`}
                            isIconOnly
                            className="z-1"
                            size="sm"
                            variant="light"
                          >
                            <VerticalMenuIcon color="#a8a29e" size={17} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label={`Options Menu For ${title} Exercise`}
                          onAction={(key) =>
                            handleGroupedSetOptionSelection(
                              key as string,
                              groupedSet
                            )
                          }
                        >
                          {isMultiset ? (
                            <DropdownItem key="add-sets-to-multiset">
                              Add Set
                            </DropdownItem>
                          ) : (
                            <DropdownItem key="add-set-to-exercise">
                              Add Set
                            </DropdownItem>
                          )}
                          <DropdownItem
                            className={isMultiset ? "" : "hidden"}
                            key="add-multiset"
                          >
                            Append Multiset
                          </DropdownItem>
                          <DropdownItem
                            className={isMultiset ? "" : "hidden"}
                            key="edit-multiset"
                          >
                            Edit Multiset
                          </DropdownItem>
                          <DropdownItem
                            className={isMultiset || isTemplate ? "hidden" : ""}
                            key="fill-in-last-workout-set-values"
                          >
                            Copy Last Completed Values
                          </DropdownItem>
                          {isExerciseInvalid ? (
                            <DropdownItem key="reassign-exercise">
                              Reassign Exercise
                            </DropdownItem>
                          ) : (
                            <DropdownItem
                              className={isMultiset ? "hidden" : ""}
                              key="change-exercise"
                            >
                              Change Exercise
                            </DropdownItem>
                          )}
                          <DropdownItem
                            className={hasNote ? "" : "hidden"}
                            key="toggle-exercise-note"
                          >
                            {groupedSet.showGroupedSetNote
                              ? `Hide ${
                                  isMultiset ? "Multiset" : "Exercise"
                                } Note`
                              : `Show ${
                                  isMultiset ? "Multiset" : "Exercise"
                                } Note`}
                          </DropdownItem>
                          <DropdownItem
                            className={
                              isMultiset || isExerciseInvalid ? "hidden" : ""
                            }
                            key="merge-grouped_set"
                          >
                            Merge Exercise Into Multiset
                          </DropdownItem>
                          {isMultiset ? (
                            <DropdownItem key="split-multiset-into-exercises">
                              Split Into Separate Exercises
                            </DropdownItem>
                          ) : (
                            <DropdownItem
                              className={isExerciseInvalid ? "hidden" : ""}
                              key="convert-exercise-to-multiset"
                            >
                              Convert To Multiset
                            </DropdownItem>
                          )}
                          <DropdownItem
                            className="text-danger"
                            key="delete-grouped_sets-sets"
                          >
                            {isMultiset && isTemplate
                              ? `Remove ${title}`
                              : isMultiset
                              ? `Delete ${title}`
                              : isTemplate
                              ? "Remove All Sets"
                              : "Delete All Sets"}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                  {groupedSet.isExpanded && (
                    <div>
                      {groupedSet.showGroupedSetNote && (
                        <div className="flex justify-between items-center px-2 pb-0.5">
                          <span className="text-stone-400 break-words text-sm max-w-[23.5rem]">
                            {isMultiset
                              ? groupedSet.multiset?.note
                              : groupedSet.exerciseList[0].note}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col divide-y border-t border-t-stone-200 divide-stone-200">
                        <SetList
                          groupedSet={groupedSet}
                          activeSetId={activeSetId}
                          clickSetAction={handleClickSet}
                          optionsSelectionAction={handleSetOptionSelection}
                          clickCommentButtonAction={updateShownSetListComments}
                          shownSetListComments={shownSetListComments}
                          isTemplate={isTemplate}
                          handleToggleSetCommentButton={
                            handleToggleSetCommentButton
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>
    </div>
  );
};
