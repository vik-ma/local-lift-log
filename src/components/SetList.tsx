import { GroupedWorkoutSet, SetListNotes, WorkoutSet } from "../typings";
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
  exercise: GroupedWorkoutSet;
  activeSetId: number;
  clickActiveSetAction?: (set: WorkoutSet, index: number) => void;
  optionsSelectionAction: (key: string, set: WorkoutSet) => void;
  clickCommentButtonAction: (exerciseId: number, index: number) => void;
  shownSetListComments: SetListNotes;
  isTemplate: boolean;
};

export const SetList = ({
  exercise,
  activeSetId,
  clickActiveSetAction,
  optionsSelectionAction,
  clickCommentButtonAction,
  shownSetListComments,
  isTemplate,
}: SetListProps) => {
  const handleClickActiveSet = (set: WorkoutSet, index: number) => {
    if (clickActiveSetAction === undefined || !isTemplate) return;

    clickActiveSetAction(set, index);
  };

  return (
    <>
      {exercise.setList.map((set, index) => (
        <div
          className={
            set.id === activeSetId
              ? "flex flex-col pl-2 bg-yellow-100 text-yellow-600 text-sm font-medium break-words cursor-pointer"
              : "flex flex-col pl-2 text-sm font-medium break-words cursor-pointer hover:bg-stone-100"
          }
          key={`${set.exercise_id}-${index}`}
          onClick={() => handleClickActiveSet(set, index)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center w-[4.5rem]">
              <span>Set {index + 1}</span>
            </div>
            <div className="flex flex-wrap justify-center w-full gap-x-5 px-1 gap-y-0.5 py-0.5">
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
                    <span className="truncate max-w-12">{set.distance}</span>
                    <span>{set.distance_unit}</span>
                  </div>
                )}
              {set.is_tracking_time === 1 &&
                (set.time_in_seconds > 0 || set.is_completed === 1) && (
                  <span className="truncate max-w-16">
                    {FormatTimeInSecondsToHhmmssString(set.time_in_seconds)}
                  </span>
                )}
              {set.is_tracking_rpe === 1 && set.is_completed === 1 && (
                <div className="flex gap-1">
                  <span>RPE</span>
                  <span className="truncate max-w-4">{set.rpe}</span>
                </div>
              )}
              {set.is_tracking_rir === 1 && (
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
            </div>
            <div className="flex w-[8.5rem] items-center justify-end">
              {set.comment !== null && (
                <div className="pr-1">
                  <Button
                    isIconOnly
                    size="sm"
                    radius="lg"
                    variant="light"
                    onPress={() =>
                        clickCommentButtonAction(exercise.exercise_id, index)
                    }
                  >
                    <CommentIcon size={21} />
                  </Button>
                </div>
              )}
              <CheckmarkIcon isChecked={set.is_completed === 1} size={18} />
              <Dropdown>
                <DropdownTrigger>
                  <Button
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
                  aria-label={`Option Menu For ${exercise.exercise_name} Set ${index}`}
                  itemClasses={{
                    base: "hover:text-[#404040] gap-4",
                  }}
                  onAction={(key) =>
                    optionsSelectionAction(key as string, set)
                  }
                >
                  <DropdownItem key="edit">Edit</DropdownItem>
                  <DropdownItem className="text-danger" key="delete-set">
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          {shownSetListComments[exercise.exercise_id]?.has(index) && (
            <span className="text-stone-400 pb-1 pr-2">{set.comment}</span>
          )}
        </div>
      ))}
    </>
  );
};
