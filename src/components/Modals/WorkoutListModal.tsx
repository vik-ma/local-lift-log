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
import { CreateWorkoutPropertySet, FormatNumItemsString } from "../../helpers";
import { useState } from "react";
import { EmptyListLabel, WorkoutPropertyDropdown, WorkoutSortDropdown } from "..";

type WorkoutListModalProps = {
  workoutListModal: UseDisclosureReturnType;
  workoutList: UseWorkoutListReturnType;
  shownWorkoutProperties: string;
  onClickAction: (workoutToCopy: Workout, keepSetValues: boolean) => void;
};

export const WorkoutListModal = ({
  workoutListModal,
  workoutList,
  shownWorkoutProperties,
  onClickAction,
}: WorkoutListModalProps) => {
  const [keepSetValues, setKeepSetValues] = useState<boolean>(false);
  const [selectedWorkoutProperties, setSelectedWorkoutProperties] = useState<
    Set<string>
  >(CreateWorkoutPropertySet(shownWorkoutProperties));

  const { workouts, sortCategory, handleSortOptionSelection } = workoutList;

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
              {workouts.length > 0 ? (
                <div className="h-[400px] flex flex-col gap-1">
                  <div className="flex justify-between items-center pl-0.5">
                    <Checkbox
                      color="primary"
                      isSelected={keepSetValues}
                      onValueChange={setKeepSetValues}
                    >
                      Also Copy Set Values
                    </Checkbox>
                    <div className="flex gap-1 pr-0.5">
                      <WorkoutPropertyDropdown
                        selectedWorkoutProperties={selectedWorkoutProperties}
                        setSelectedWorkoutProperties={
                          setSelectedWorkoutProperties
                        }
                        hideDetailsButtonOption
                      />
                      <WorkoutSortDropdown
                        sortCategory={sortCategory}
                        handleSortOptionSelection={handleSortOptionSelection}
                      />
                    </div>
                  </div>
                  <ScrollShadow className="flex flex-col gap-1">
                    <div className="flex flex-col gap-1 w-full">
                      {workouts.map((workout) => (
                        <div
                          key={workout.id}
                          className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          onClick={() => onClickAction(workout, keepSetValues)}
                        >
                          <div className="flex flex-col pl-2 py-1">
                            <span className={`w-[24rem] truncate`}>
                              {workout.formattedDate}
                            </span>
                            {workout.workoutTemplateName !== null &&
                              selectedWorkoutProperties.has("template") && (
                                <span className="w-[24rem] truncate text-sm text-indigo-500">
                                  {workout.workoutTemplateName}
                                </span>
                              )}
                            {workout.hasInvalidWorkoutTemplate &&
                              selectedWorkoutProperties.has("template") && (
                                <span className="w-[24rem] truncate text-sm text-red-700">
                                  Unknown Workout Template
                                </span>
                              )}
                            {workout.numSets! > 0 ? (
                              <span className="text-xs text-secondary">
                                {FormatNumItemsString(
                                  workout.numExercises,
                                  "Exercise"
                                )}
                                , {FormatNumItemsString(workout.numSets, "Set")}
                              </span>
                            ) : (
                              <span className="text-xs text-stone-400">
                                Empty
                              </span>
                            )}
                            {selectedWorkoutProperties.has("note") && (
                              <span className="w-[24rem] break-all text-xs text-stone-500 text-left">
                                {workout.note}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {workouts.length === 0 && (
                        <EmptyListLabel itemName="Workouts" />
                      )}
                    </div>
                  </ScrollShadow>
                </div>
              ) : (
                <div className="flex justify-center text-stone-500 font-medium">
                  No Workouts Created
                </div>
              )}
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
