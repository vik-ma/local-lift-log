import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { Workout } from "../typings";
import { VerticalMenuIcon } from "../assets";
import { FormatNumItemsString } from "../helpers";

type WorkoutListItemProps = {
  workout: Workout;
  selectedWorkoutProperties: Set<string>;
  onClickAction: () => void;
  editWorkout?: (workout: Workout) => void;
  handleWorkoutOptionSelection?: (key: string, workout: Workout) => void;
};

export const WorkoutListItem = ({
  workout,
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
      <div className="flex flex-col w-[21.75rem] pl-2 py-1">
        <span className="truncate text-stone-600">{workout.formattedDate}</span>
        {workout.workoutTemplate !== undefined &&
          selectedWorkoutProperties.has("template") && (
            <span className="truncate text-xs text-indigo-500">
              {workout.workoutTemplate.name}
            </span>
          )}
        {workout.hasInvalidWorkoutTemplate &&
          selectedWorkoutProperties.has("template") && (
            <span className="truncate text-xs text-red-700">
              Unknown Workout Template
            </span>
          )}
        {workout.routine !== undefined &&
          selectedWorkoutProperties.has("routine") && (
            <span className="truncate text-xs text-violet-700">
              {workout.routine.name}
            </span>
          )}
        {workout.hasInvalidRoutine &&
          selectedWorkoutProperties.has("routine") && (
            <span className="truncate text-xs text-red-700">
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
        {selectedWorkoutProperties.has("comment") && (
          <span className="break-all text-xs text-stone-500 text-left">
            {workout.comment}
          </span>
        )}
      </div>
      {editWorkout !== undefined &&
        handleWorkoutOptionSelection !== undefined && (
          <div className="pr-1">
            <Dropdown shouldBlockScroll={false}>
              <DropdownTrigger>
                <Button
                  aria-label="Toggle Workout On ${workout.formattedDate} Options Menu"
                  isIconOnly
                  className="z-1"
                  radius="lg"
                  variant="light"
                >
                  <VerticalMenuIcon size={19} color="#888" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Option Menu For Workout On ${workout.formattedDate}"
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
