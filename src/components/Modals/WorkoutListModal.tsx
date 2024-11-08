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
import { CreateWorkoutPropertySet } from "../../helpers";
import { useState } from "react";
import {
  EmptyListLabel,
  WorkoutListItem,
  WorkoutPropertyDropdown,
  WorkoutSortDropdown,
} from "..";

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
                        <WorkoutListItem
                          key={workout.id}
                          workout={workout}
                          listItemTextWidth="w-[23rem]"
                          selectedWorkoutProperties={selectedWorkoutProperties}
                          onClickAction={() =>
                            onClickAction(workout, keepSetValues)
                          }
                        />
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
