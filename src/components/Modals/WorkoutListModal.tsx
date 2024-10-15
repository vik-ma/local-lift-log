import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
  Checkbox,
} from "@nextui-org/react";
import {
  UseDisclosureReturnType,
  UseWorkoutListReturnType,
  Workout,
} from "../../typings";
import { FormatNumItemsString } from "../../helpers";
import { useState } from "react";
import { EmptyListLabel } from "..";

type WorkoutListModalProps = {
  workoutListModal: UseDisclosureReturnType;
  workoutList: UseWorkoutListReturnType;
  onClickAction: (workoutToCopy: Workout, keepSetValues: boolean) => void;
};

export const WorkoutListModal = ({
  workoutListModal,
  workoutList,
  onClickAction,
}: WorkoutListModalProps) => {
  const [keepSetValues, setKeepSetValues] = useState<boolean>(false);

  const { workouts } = workoutList;

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
                  <div className="flex justify-between items-center px-1">
                    <Checkbox
                      color="primary"
                      isSelected={keepSetValues}
                      onValueChange={setKeepSetValues}
                    >
                      Keep Set Values
                    </Checkbox>
                    {/* TODO: ADD SORT AND SEARCH INPUTS */}
                  </div>
                )}
                {workouts.length > 0 ? (
                  <ScrollShadow className="flex flex-col gap-1">
                    <div className="flex flex-col gap-1 w-full">
                      {workouts.map((workout) => (
                        <div
                          key={workout.id}
                          className="flex cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          onClick={() => onClickAction(workout, keepSetValues)}
                        >
                          <div className="flex gap-1 justify-between items-center w-full">
                            <div className="flex flex-col justify-start items-start">
                              <span className="w-[10.5rem] truncate text-left">
                                {workout.formattedDate}
                              </span>
                              {workout.numSets! > 0 ? (
                                <span className="text-xs text-secondary text-left">
                                  {FormatNumItemsString(
                                    workout.numExercises,
                                    "Exercise"
                                  )}
                                  ,{" "}
                                  {FormatNumItemsString(workout.numSets, "Set")}
                                </span>
                              ) : (
                                <span className="text-xs text-stone-400 text-left">
                                  Empty
                                </span>
                              )}
                              <span className="w-[21.5rem] break-all text-xs text-stone-500 text-left">
                                {workout.note}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {workouts.length === 0 && (
                        <EmptyListLabel itemName="Workouts" />
                      )}
                    </div>
                  </ScrollShadow>
                ) : (
                  <div className="flex justify-center text-stone-500 font-medium">
                    No Workouts Completed
                  </div>
                )}
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
