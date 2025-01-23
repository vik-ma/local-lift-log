import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { Workout } from "../typings";
import { RatingIcon, VerticalMenuIcon } from "../assets";
import { FormatNumItemsString } from "../helpers";

type WorkoutListItemProps = {
  workout: Workout;
  listItemTextWidth: string;
  selectedWorkoutProperties: Set<string>;
  onClickAction: () => void;
  editWorkout?: (workout: Workout) => void;
  handleWorkoutOptionSelection?: (key: string, workout: Workout) => void;
};

export const WorkoutListItem = ({
  workout,
  listItemTextWidth,
  selectedWorkoutProperties,
  onClickAction,
  editWorkout,
  handleWorkoutOptionSelection,
}: WorkoutListItemProps) => {
  const numExercises =
    workout.exerciseIdSet !== undefined ? workout.exerciseIdSet.size : 0;

  return (
    <div
      className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
      onClick={onClickAction}
    >
      <div className="flex flex-col pl-2 py-1">
        <span className={`${listItemTextWidth} truncate text-stone-600`}>
          {workout.formattedDate}
        </span>
        {workout.workoutTemplate !== undefined &&
          selectedWorkoutProperties.has("template") && (
            <span
              className={`${listItemTextWidth} truncate text-xs text-indigo-500`}
            >
              {workout.workoutTemplate.name}
            </span>
          )}
        {workout.hasInvalidWorkoutTemplate &&
          selectedWorkoutProperties.has("template") && (
            <span
              className={`${listItemTextWidth} truncate text-xs text-red-700`}
            >
              Unknown Workout Template
            </span>
          )}
        {workout.routine !== undefined &&
          selectedWorkoutProperties.has("routine") && (
            <span
              className={`${listItemTextWidth} truncate text-xs text-violet-700`}
            >
              {workout.routine.name}
            </span>
          )}
        {workout.hasInvalidRoutine &&
          selectedWorkoutProperties.has("routine") && (
            <span
              className={`${listItemTextWidth} truncate text-xs text-red-700`}
            >
              Unknown Routine
            </span>
          )}
        {workout.numSets! > 0 ? (
          <span className="text-xs text-secondary">
            {FormatNumItemsString(numExercises, "Exercise")},{" "}
            {FormatNumItemsString(workout.numSets, "Set")}
          </span>
        ) : (
          <span className="text-xs text-stone-400">Empty</span>
        )}
        {selectedWorkoutProperties.has("note") && (
          <span
            className={`${listItemTextWidth} break-all text-xs text-stone-500 text-left`}
          >
            {workout.note}
          </span>
        )}
      </div>
      {editWorkout !== undefined &&
        handleWorkoutOptionSelection !== undefined && (
          <div className="flex items-center gap-1 pr-1">
            {selectedWorkoutProperties.has("details") && (
              <Button
                variant="flat"
                isIconOnly
                onPress={() => editWorkout(workout)}
              >
                <RatingIcon />
              </Button>
            )}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  aria-label={`Toggle Workout On ${workout.formattedDate} Options Menu`}
                  isIconOnly
                  className="z-1"
                  radius="lg"
                  variant="light"
                >
                  <VerticalMenuIcon size={19} color="#888" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label={`Option Menu For Workout On ${workout.formattedDate}`}
                onAction={(key) =>
                  handleWorkoutOptionSelection(key as string, workout)
                }
              >
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem
                  className={workout.hasInvalidWorkoutTemplate ? "" : "hidden"}
                  key="reassign-workout-template"
                >
                  Reassign Workout Template
                </DropdownItem>
                <DropdownItem
                  className={workout.hasInvalidRoutine ? "" : "hidden"}
                  key="reassign-routine"
                >
                  Reassign Routine
                </DropdownItem>
                <DropdownItem key="delete" className="text-danger">
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
    </div>
  );
};
