import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@nextui-org/react";
import { UseDisclosureReturnType } from "../../typings";
import { useState } from "react";
import { ExerciseGroupCheckboxes, ExerciseModalList } from "..";

type FilterWorkoutTemplateListModalProps = {
  filterWorkoutTemplateListModal: UseDisclosureReturnType;
};

type ModalPage = "base" | "exercise-list" | "exercise-groups";

export const FilterWorkoutTemplateListModal = ({
  filterWorkoutTemplateListModal,
}: FilterWorkoutTemplateListModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  return (
    <Modal
      isOpen={filterWorkoutTemplateListModal.isOpen}
      onOpenChange={filterWorkoutTemplateListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {modalPage === "exercise-list"
                ? "Select Exercises To Filter"
                : modalPage === "exercise-groups"
                ? "Select Exercise Groups To Filter"
                : "Filter Workout Templates"}
            </ModalHeader>
            <ModalBody>
              {modalPage === "exercise-list" ? (
                <></>
              ) : // <ExerciseModalList
              //   handleClickExercise={handleClickExercise}
              //   exerciseList={useExerciseList}
              //   useFilterExerciseList={useFilterExerciseList}
              //   userSettingsId={userSettings.id}
              //   filterExercises={filterExercises}
              // />
              modalPage === "exercise-groups" ? (
                <div className="h-[400px]">
                  {/* <ExerciseGroupCheckboxes
                    isValid={true}
                    value={filterExerciseGroups}
                    handleChange={setFilterExerciseGroups}
                    exerciseGroupDictionary={exerciseGroupDictionary}
                    includeSecondaryGroups={includeSecondaryGroups}
                    setIncludeSecondaryGroups={setIncludeSecondaryGroups}
                  /> */}
                </div>
              ) : (
                <ScrollShadow className="h-[400px]">
                  <div className="flex flex-col gap-3 w-[24rem]">
                    <div className="flex flex-col gap-1">
                      {/* <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Exercises{" "}
                          {filterExercises.size > 0 &&
                            `(${filterExercises.size})`}
                        </h3>
                        <div className="flex justify-between items-center px-0.5">
                          <div
                            className={
                              filterExercises.size === 0
                                ? "w-[16rem] text-sm break-words text-stone-400"
                                : "w-[16rem] text-sm break-words text-secondary"
                            }
                          >
                            {filterExercisesString}
                          </div>
                          <Button
                            className="w-[7rem]"
                            variant="flat"
                            size="sm"
                            onPress={() =>
                              setFilterWorkoutListModalPage("exercise-list")
                            }
                          >
                            Filter Exercises
                          </Button>
                        </div>
                      </div> */}
                      {/* <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Exercise Groups{" "}
                          {filterExerciseGroups.length > 0 &&
                            `(${filterExerciseGroups.length})`}
                        </h3>
                        <div className="flex justify-between items-center px-0.5">
                          <div
                            className={
                              filterExerciseGroups.length === 0
                                ? "flex flex-col w-[16rem] text-sm break-words text-stone-400"
                                : "flex flex-col w-[16rem] text-sm break-words text-secondary"
                            }
                          >
                            <span>{filterExerciseGroupsString}</span>
                            {filterExerciseGroups.length > 0 &&
                              includeSecondaryGroups && (
                                <span className="text-stone-600 font-medium text-xs">
                                  Including Secondary Exercise Groups
                                </span>
                              )}
                          </div>
                          <Button
                            className="w-[7rem]"
                            variant="flat"
                            size="sm"
                            onPress={() => setModalPage("exercise-groups")}
                          >
                            Filter Groups
                          </Button>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </ScrollShadow>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                {modalPage !== "base" ? (
                  <>
                    {/* {showClearAllButton && (
                      <Button
                        variant="flat"
                        color="danger"
                        onPress={handleClearAllButton}
                      >
                        Clear All
                      </Button>
                    )} */}
                  </>
                ) : (
                  <>
                    {/* {showResetFilterButton && (
                      <Button
                        variant="flat"
                        color="danger"
                        onPress={resetFilter}
                      >
                        Reset All Filters
                      </Button>
                    )} */}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={
                    modalPage === "base" ? onClose : () => setModalPage("base")
                  }
                >
                  {modalPage === "base" ? "Close" : "Back"}
                </Button>
                {/* <Button
                  color="primary"
                  onPress={
                    modalPage === "base"
                      ? () =>
                          handleFilterSaveButton(
                            userSettings.locale,
                            filterWorkoutTemplateListModal
                          )
                      : () => setModalPage("base")
                  }
                >
                  {modalPage === "base" ? "Filter" : "Done"}
                </Button> */}
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};