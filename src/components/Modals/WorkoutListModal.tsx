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
  SearchInput,
  WorkoutListItem,
  WorkoutListOptions,
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

  const {
    workouts,
    filteredWorkouts,
    filterQuery,
    setFilterQuery,
    sortCategory,
    handleSortOptionSelection,
  } = workoutList;

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
              <div className="h-[440px] flex flex-col gap-1.5">
                <div className="flex flex-col gap-1.5">
                  <SearchInput
                    filterQuery={filterQuery}
                    setFilterQuery={setFilterQuery}
                    filteredListLength={filteredWorkouts.length}
                    totalListLength={workouts.length}
                  />
                  <div className="flex justify-between items-center pl-0.5">
                    <div></div>
                    <WorkoutListOptions
                      sortCategory={sortCategory}
                      handleSortOptionSelection={handleSortOptionSelection}
                      selectedWorkoutProperties={selectedWorkoutProperties}
                      setSelectedWorkoutProperties={
                        setSelectedWorkoutProperties
                      }
                      hideDetailsButtonOption
                    />
                  </div>
                </div>
                <ScrollShadow className="flex flex-col gap-1">
                  <div className="flex flex-col gap-1 w-full">
                    {filteredWorkouts.map((workout) => (
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
                    {filteredWorkouts.length === 0 && (
                      <EmptyListLabel itemName="Workouts" />
                    )}
                  </div>
                </ScrollShadow>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <Checkbox
                color="primary"
                isSelected={keepSetValues}
                onValueChange={setKeepSetValues}
              >
                Also Copy Set Values
              </Checkbox>
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
