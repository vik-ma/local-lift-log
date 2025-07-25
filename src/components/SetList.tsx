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
} from "@heroui/react";
import {
  CheckmarkIcon,
  VerticalMenuIcon,
  CommentIcon,
  EditIcon,
} from "../assets";
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
  openSetNotesModal: (
    set: WorkoutSet,
    index: number,
    groupedSet: GroupedWorkoutSet
  ) => void;
};

export const SetList = ({
  groupedSet,
  activeSetId,
  clickSetAction,
  optionsSelectionAction,
  clickCommentButtonAction,
  shownSetListComments,
  isTemplate,
  openSetNotesModal,
}: SetListProps) => {
  let setNum = 0;

  return (
    <>
      {groupedSet.setList.map((set, index) => {
        const isMultiset = groupedSet.isMultiset === true;

        const exercise = isMultiset
          ? groupedSet.exerciseList[index]
          : groupedSet.exerciseList[0];

        const multisetSetNum =
          groupedSet.multiset?.setListIndexCutoffs?.get(index);

        if (!isMultiset && set.is_warmup === 0) {
          setNum++;
        }

        return (
          <div
            // Add multiset-divider to Multiset Sets above 1
            // Highlight activeSet in different color
            className={
              multisetSetNum && multisetSetNum !== 1 && set.id === activeSetId
                ? "flex flex-col multiset-divider pl-1.5 bg-[#fffbd0] text-secondary text-sm font-medium break-words cursor-pointer"
                : multisetSetNum && multisetSetNum !== 1
                ? "flex flex-col multiset-divider pl-1.5 text-sm font-medium break-words cursor-pointer hover:bg-stone-100"
                : set.id === activeSetId
                ? "flex flex-col pl-1.5 bg-[#fffbd0] text-secondary text-sm font-medium break-words cursor-pointer"
                : "flex flex-col pl-1.5 text-sm font-medium break-words cursor-pointer hover:bg-stone-100"
            }
            key={set.id}
            onClick={() => clickSetAction(set, index, exercise, groupedSet)}
          >
            <div className="flex justify-between items-center">
              <div
                className={isMultiset ? "flex flex-col w-full" : "flex w-full"}
              >
                <div
                  className={
                    isMultiset
                      ? "flex relative leading-snug items-end w-[19rem]"
                      : "flex items-center"
                  }
                >
                  {isMultiset && multisetSetNum && (
                    <div className="absolute right-0 flex gap-1.5 items-baseline">
                      {set.is_warmup === 1 && (
                        <span className="text-xs text-secondary">Warmup</span>
                      )}
                      <span className="w-[3rem] truncate text-stone-400">
                        Set {multisetSetNum}
                      </span>
                    </div>
                  )}
                  <span
                    className={
                      isMultiset && set.is_warmup === 1
                        ? "truncate text-stone-500 max-w-[12.5rem] pt-0.5"
                        : isMultiset && set.is_warmup === 0
                        ? "truncate text-stone-500 max-w-[15.5rem] pt-0.5"
                        : "truncate text-stone-500 w-[3rem]"
                    }
                  >
                    {isMultiset ? (
                      <span
                        className={exercise.isInvalid ? "text-red-700" : ""}
                      >
                        {exercise.name}
                      </span>
                    ) : !isMultiset && set.is_warmup === 1 ? (
                      <span className="text-secondary text-xs">Warmup</span>
                    ) : (
                      `Set ${setNum}`
                    )}
                  </span>
                </div>
                <div
                  className={
                    isMultiset
                      ? "flex flex-wrap leading-snug justify-start w-[16rem] gap-x-5 pb-0.5"
                      : "flex flex-wrap justify-evenly w-[16rem] px-1 gap-x-5 py-0.5"
                  }
                >
                  {set.is_tracking_weight === 1 &&
                    (set.weight > 0 || set.is_completed === 1) && (
                      <span className="truncate max-w-[4.25rem]">
                        {set.weight} {set.weight_unit}
                      </span>
                    )}
                  {set.is_tracking_reps === 1 &&
                    (set.reps > 0 || set.is_completed === 1) && (
                      <span className="truncate max-w-[4.25rem]">
                        {set.reps} Rep
                        {set.reps !== 1 && "s"}
                      </span>
                    )}
                  {set.is_tracking_distance === 1 &&
                    (set.distance > 0 || set.is_completed === 1) && (
                      <span className="truncate max-w-[4.25rem]">
                        {set.distance} {set.distance_unit}
                      </span>
                    )}
                  {set.is_tracking_time === 1 &&
                    (set.time_in_seconds > 0 || set.is_completed === 1) && (
                      <span className="truncate max-w-16">
                        {FormatTimeInSecondsToHhmmssString(set.time_in_seconds)}
                      </span>
                    )}
                  {set.is_tracking_rpe === 1 && set.rpe > 0 && (
                    <span className="truncate max-w-[3rem]">RPE {set.rpe}</span>
                  )}
                  {set.is_tracking_rir === 1 && set.rir > -1 && (
                    <span className="truncate max-w-[3rem]">{set.rir} RIR</span>
                  )}
                  {set.is_tracking_resistance_level === 1 &&
                    (set.resistance_level > 0 || set.is_completed === 1) && (
                      <span className="truncate max-w-[9rem]">
                        Resistance Level {set.resistance_level}
                      </span>
                    )}
                  {set.is_tracking_partial_reps === 1 &&
                    (set.partial_reps > 0 || set.is_completed === 1) && (
                      <span className="truncate max-w-[7rem]">
                        {set.partial_reps} Partial Rep
                        {set.partial_reps !== 1 && "s"}
                      </span>
                    )}
                  {set.is_tracking_user_weight === 1 &&
                    set.user_weight > 0 &&
                    set.is_completed === 1 && (
                      <span className="truncate max-w-[10rem] text-slate-400">
                        Body Weight {set.user_weight} {set.user_weight_unit}
                      </span>
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
                <Dropdown shouldBlockScroll={false}>
                  <DropdownTrigger>
                    <Button
                      aria-label={`Toggle ${exercise.name} Set ${index} Options Menu`}
                      isIconOnly
                      className="z-1"
                      size="sm"
                      radius="lg"
                      variant="light"
                    >
                      <VerticalMenuIcon color="#a8a29e" size={14} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={`Options Menu For ${exercise.name} Set ${index}`}
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
                    <DropdownItem key="edit" className="text-slate-400">
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      className={
                        groupedSet.isMultiset && exercise.isInvalid
                          ? "text-secondary"
                          : "hidden"
                      }
                      key="reassign-exercise"
                    >
                      Reassign Exercise
                    </DropdownItem>
                    <DropdownItem
                      className={
                        groupedSet.isMultiset && !exercise.isInvalid
                          ? ""
                          : "hidden"
                      }
                      key="change-exercise"
                    >
                      Change Exercise
                    </DropdownItem>
                    <DropdownItem key="view-notes">View Notes</DropdownItem>
                    {set.is_warmup === 1 ? (
                      <DropdownItem key="unset-warmup">
                        Unset Warmup
                      </DropdownItem>
                    ) : (
                      <DropdownItem key="set-warmup">Set Warmup</DropdownItem>
                    )}
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
              <div className="flex justify-between items-center pb-px pr-2">
                <span className="text-stone-400 font-normal max-w-[21.75rem]">
                  {isTemplate ? `${set.note}` : `${set.comment}`}
                </span>
                <Button
                  aria-label={`Toggle ${exercise.name} Set ${index} ${
                    isTemplate ? "Note" : "Comment"
                  } Input`}
                  isIconOnly
                  className="z-1 h-7"
                  size="sm"
                  radius="lg"
                  variant="light"
                  onPress={() => openSetNotesModal(set, index, groupedSet)}
                >
                  <EditIcon size={22} color="#808080" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
