import {
  GroupedWorkoutSet,
  SetListNotes,
  WorkoutSet,
  Exercise,
} from "../typings";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { CheckmarkIcon, VerticalMenuIcon, CommentIcon } from "../assets";
import { FormatTimeInSecondsToHhmmssString } from "../helpers";

type SetListProps = {
  groupedSet: GroupedWorkoutSet;
  activeSetId: number;
  clickSetAction: (
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => void;
  optionsSelectionAction: (
    key: string,
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => void;
  clickCommentButtonAction: (groupedSetId: string, index: number) => void;
  shownSetListComments: SetListNotes;
  isTemplate: boolean;
};

export const SetList = ({
  groupedSet,
  activeSetId,
  clickSetAction,
  optionsSelectionAction,
  clickCommentButtonAction,
  shownSetListComments,
  isTemplate,
}: SetListProps) => {
  return (
    <>
      {groupedSet.setList.map((set, index) => {
        const isMultiset = groupedSet.isMultiset ? true : false;

        const exercise = isMultiset
          ? groupedSet.exerciseList[index]
          : groupedSet.exerciseList[0];
        return (
          <div
            className={
              set.id === activeSetId
                ? "flex flex-col pl-1.5 bg-yellow-100 text-yellow-600 text-sm font-medium break-words cursor-pointer"
                : "flex flex-col pl-1.5 text-sm font-medium break-words cursor-pointer hover:bg-stone-100"
            }
            key={set.id}
            onClick={() => clickSetAction(set, index, exercise, groupedSet)}
          >
            <div
              className={
                isMultiset
                  ? "flex justify-between items-center"
                  : "flex justify-between items-center"
              }
            >
              <div
                className={isMultiset ? "flex flex-col w-full" : "flex w-full"}
              >
                <div
                  className={
                    isMultiset
                      ? "flex items-center w-[19rem]"
                      : "flex items-center"
                  }
                >
                  <span
                    className={
                      isMultiset
                        ? "truncate text-stone-400"
                        : "truncate text-stone-500 w-[3rem]"
                    }
                  >
                    {isMultiset ? exercise.name : `Set ${index + 1}`}
                  </span>
                </div>
                <div
                  className={
                    isMultiset
                      ? "flex flex-wrap justify-start w-full gap-x-5 gap-y-0.5 py-0.5"
                      : "flex flex-wrap justify-evenly w-full gap-x-5 px-1 gap-y-0.5 py-0.5"
                  }
                >
                  {set.is_tracking_weight === 1 &&
                    (set.weight > 0 || set.is_completed === 1) && (
                      <div className="flex gap-1">
                        <span className="truncate max-w-12">{set.weight}</span>
                        <span>{set.weight_unit}</span>
                      </div>
                    )}
                  {set.is_tracking_reps === 1 &&
                    (set.reps > 0 || set.is_completed === 1) && (
                      <div className="flex gap-1">
                        <span className="truncate max-w-12">{set.reps}</span>
                        <span>
                          Rep
                          {set.reps !== 1 && "s"}
                        </span>
                      </div>
                    )}
                  {set.is_tracking_distance === 1 &&
                    (set.distance > 0 || set.is_completed === 1) && (
                      <div className="flex gap-1">
                        <span className="truncate max-w-12">
                          {set.distance}
                        </span>
                        <span>{set.distance_unit}</span>
                      </div>
                    )}
                  {set.is_tracking_time === 1 &&
                    (set.time_in_seconds > 0 || set.is_completed === 1) && (
                      <span className="truncate max-w-16">
                        {FormatTimeInSecondsToHhmmssString(set.time_in_seconds)}
                      </span>
                    )}
                  {set.is_tracking_rpe === 1 && set.rpe > 0 && (
                    <div className="flex gap-1">
                      <span>RPE</span>
                      <span className="truncate max-w-4">{set.rpe}</span>
                    </div>
                  )}
                  {set.is_tracking_rir === 1 && set.rir > -1 && (
                    <div className="flex gap-1">
                      <span className="truncate max-w-10">{set.rir}</span>
                      <span>RIR</span>
                    </div>
                  )}
                  {set.is_tracking_resistance_level === 1 &&
                    (set.resistance_level > 0 || set.is_completed === 1) && (
                      <div className="flex gap-1">
                        <span>Resistance Level</span>
                        <span className="truncate max-w-12">
                          {set.resistance_level}
                        </span>
                      </div>
                    )}
                  {set.is_tracking_partial_reps === 1 &&
                    (set.partial_reps > 0 || set.is_completed === 1) && (
                      <div className="flex gap-1">
                        <span className="truncate max-w-10">
                          {set.partial_reps}
                        </span>
                        <span>
                          Partial Rep
                          {set.partial_reps !== 1 && "s"}
                        </span>
                      </div>
                    )}
                </div>
              </div>
              <div
                className={
                  isTemplate
                    ? "flex w-[6rem] items-center justify-end"
                    : "flex w-[8.5rem] items-center justify-end"
                }
              >
                {((!isTemplate && set.comment !== null) ||
                  (isTemplate && set.note !== null)) && (
                  <div className={isTemplate ? "" : "pr-1"}>
                    <Button
                      aria-label={`Toggle ${exercise.name} Set ${index} Comment`}
                      isIconOnly
                      size="sm"
                      radius="lg"
                      variant="light"
                      onPress={() =>
                        clickCommentButtonAction(groupedSet.id, index)
                      }
                    >
                      <CommentIcon size={21} />
                    </Button>
                  </div>
                )}
                {!isTemplate && (
                  <CheckmarkIcon isChecked={set.is_completed === 1} size={18} />
                )}
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      aria-label={`Toggle ${exercise.name} Set ${index} Options Menu`}
                      isIconOnly
                      className="z-1"
                      size="sm"
                      radius="lg"
                      variant="light"
                    >
                      <VerticalMenuIcon size={14} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={`Option Menu For ${exercise.name} Set ${index}`}
                    onAction={(key) =>
                      optionsSelectionAction(
                        key as string,
                        set,
                        index,
                        exercise,
                        groupedSet
                      )
                    }
                  >
                    <DropdownItem key="edit">Edit</DropdownItem>
                    <DropdownItem
                      className={set.is_completed === 0 ? "hidden" : ""}
                      key="update-completed-set-time"
                    >
                      Change Time Completed
                    </DropdownItem>
                    <DropdownItem key="delete-set" className="text-danger">
                      {isTemplate ? "Remove" : "Delete"}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            {shownSetListComments[groupedSet.id]?.has(index) && (
              <span className="text-stone-400 pb-1 pr-2">
                {isTemplate ? `${set.note}` : `${set.comment}`}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
};
