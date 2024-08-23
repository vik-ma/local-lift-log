import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
} from "@nextui-org/react";
import { UseDisclosureReturnType, UserSettings, Workout } from "../../typings";
import { useWorkoutList, useWorkoutRatingMap } from "../../hooks";
import { FormatNumItemsString } from "../../helpers";

type WorkoutListModalProps = {
  workoutListModal: UseDisclosureReturnType;
  userSettings: UserSettings;
  onClickAction: (workout: Workout) => void;
};

export const WorkoutListModal = ({
  workoutListModal,
  userSettings,
  onClickAction,
}: WorkoutListModalProps) => {
  const { workoutRatingMap } = useWorkoutRatingMap();

  const { workouts, showNewestFirst, reverseWorkoutList } = useWorkoutList();

  return (
    <Modal
      isOpen={workoutListModal.isOpen}
      onOpenChange={workoutListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Select Workout</ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-2">
                {workouts.length > 0 && (
                  <div className="flex justify-center">
                    <Button
                      className="w-32"
                      size="sm"
                      variant="flat"
                      onPress={() => reverseWorkoutList()}
                    >
                      {showNewestFirst
                        ? "List Oldest First"
                        : "List Latest First"}
                    </Button>
                  </div>
                )}
                <ScrollShadow className="flex flex-col gap-1">
                  <div className="flex flex-col gap-1 w-full">
                    {workouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="flex cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        onClick={() => onClickAction(workout)}
                      >
                        <div className="flex gap-1 justify-between items-center w-full">
                          <div className="flex flex-col justify-start items-start">
                            <span className="w-[10.5rem] truncate text-left">
                              {workout.date}
                            </span>
                            {workout.numSets! > 0 ? (
                              <span className="text-xs text-secondary text-left">
                                {FormatNumItemsString(
                                  workout.numExercises,
                                  "Exercise"
                                )}
                                , {FormatNumItemsString(workout.numSets, "Set")}
                              </span>
                            ) : (
                              <span className="text-xs text-stone-400 text-left">
                                Empty
                              </span>
                            )}
                            <span
                              className={
                                userSettings.show_workout_rating === 1
                                  ? "w-[16.5rem] break-all text-xs text-stone-500 text-left"
                                  : "w-[21.5rem] break-all text-xs text-stone-500 text-left"
                              }
                            >
                              {workout.note}
                            </span>
                          </div>
                          {userSettings.show_workout_rating === 1 && (
                            <div className="flex flex-col w-[4.5rem] text-center text-sm text-stone-500">
                              <span>Rating</span>
                              <span className="font-semibold">
                                {workoutRatingMap[workout.rating].span}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};