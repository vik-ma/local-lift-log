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
  Exercise,
  MultisetTypeMap,
} from "../typings";

type WorkoutExerciseListProps = {
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

export const WorkoutExerciseList = ({
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
}: WorkoutExerciseListProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-center gap-3">
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
            <span className="text-xs italic text-stone-500 font-normal">
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

            // TODO: ADD ISINVALID FOR MULTISET
            const isInvalid = groupedSet.exerciseList[0].isInvalid;

            const title = isMultiset
              ? multisetTypeMap[groupedSet.multiset!.multiset_type].text
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
                    className="flex justify-between pl-2 py-1 h-14 w-full rounded-lg cursor-pointer hover:bg-stone-100"
                    onClick={() => handleGroupedSetAccordionClick(groupedSet)}
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex gap-3">
                        <h3
                          className={
                            isInvalid
                              ? "text-lg font-medium truncate max-w-80 text-red-700"
                              : "text-lg font-medium truncate max-w-80 text-yellow-600"
                          }
                        >
                          {title}
                        </h3>
                        {isInvalid && (
                          <Button
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
                            ? "text-sm text-success"
                            : "text-sm text-stone-500"
                        }
                      >
                        {completedSetsMap
                          ? `${completedSetsMap.get(groupedSet.id)}/${
                              groupedSet.setList.length
                            } Sets Completed`
                          : `${groupedSet.setList.length} Set${
                              groupedSet.setList.length > 1 ? "s" : ""
                            }`}
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
                          aria-label={`Option Menu For ${title} Exercise`}
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
                            className={
                              (isMultiset &&
                                groupedSet.multiset?.note === null) ||
                              groupedSet.exerciseList[0].note === null
                                ? "hidden"
                                : ""
                            }
                            key="toggle-exercise-note"
                          >
                            {groupedSet.showExerciseNote
                              ? `Hide ${
                                  isMultiset ? "Multiset" : "Exercise"
                                } Note`
                              : `Show ${
                                  isMultiset ? "Multiset" : "Exercise"
                                } Note`}
                          </DropdownItem>
                          {!isMultiset &&
                          groupedSet.exerciseList[0].isInvalid ? (
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
                            className="text-danger"
                            key="delete-grouped_sets-sets"
                          >
                            {isMultiset
                              ? `Remove ${title}`
                              : isTemplate
                              ? "Remove All Sets"
                              : "Delete All Sets"}
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
                            {isMultiset
                              ? groupedSet.multiset?.note
                              : groupedSet.exerciseList[0].note}
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
                        handleToggleSetCommentButton={
                          handleToggleSetCommentButton
                        }
                      />
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
