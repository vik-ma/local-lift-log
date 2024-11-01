import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
} from "@nextui-org/react";
import {
  Exercise,
  ExerciseGroupMap,
  UseDisclosureReturnType,
} from "../../typings";
import {
  ConvertExerciseGroupStringListPrimaryToString,
  ConvertExerciseGroupSetStringPrimary,
  ConvertExerciseGroupSetStringSecondary,
  ConvertExerciseGroupStringMapSecondaryToString,
} from "../../helpers";
import { ExerciseGroupCheckboxes } from "..";
import { useState } from "react";
import { ChevronIcon } from "../../assets";
import { AnimatePresence, motion } from "framer-motion";

type ExerciseModalProps = {
  exerciseModal: UseDisclosureReturnType;
  exercise: Exercise;
  setExercise: React.Dispatch<React.SetStateAction<Exercise>>;
  isExerciseNameValid: boolean;
  isExerciseGroupSetPrimaryStringValid: boolean;
  exerciseGroupDictionary: ExerciseGroupMap;
  buttonAction: () => void;
};

export const ExerciseModal = ({
  exerciseModal,
  exercise,
  setExercise,
  isExerciseNameValid,
  isExerciseGroupSetPrimaryStringValid,
  exerciseGroupDictionary,
  buttonAction,
}: ExerciseModalProps) => {
  const [isPrimaryAccordionExpanded, setIsPrimaryAccordionExpanded] =
    useState<boolean>(true);
  const [isSecondaryAccordionExpanded, setIsSecondaryAccordionExpanded] =
    useState<boolean>(false);
  const [isMultiplierAccordionExpanded, setIsMultiplierAccordionExpanded] =
    useState<boolean>(false);

  const handleExerciseGroupStringPrimaryChange = (
    exerciseGroupStringListPrimary: string[]
  ) => {
    const exerciseGroupSetString =
      ConvertExerciseGroupStringListPrimaryToString(
        exerciseGroupStringListPrimary
      );

    const convertedValuesPrimary = ConvertExerciseGroupSetStringPrimary(
      exerciseGroupSetString
    );

    setExercise((prev) => ({
      ...prev,
      exercise_group_set_string_primary: exerciseGroupSetString,
      exerciseGroupStringListPrimary: exerciseGroupStringListPrimary,
      formattedGroupStringPrimary: convertedValuesPrimary.formattedString,
    }));

    if (exercise.exerciseGroupStringMapSecondary !== undefined) {
      for (const group of exerciseGroupStringListPrimary) {
        if (exercise.exerciseGroupStringMapSecondary.has(group)) {
          // Remove Primary Exercise Group from Secondary Exercise Groups if it exists
          handleExerciseGroupStringSecondaryChange(
            Array.from(exercise.exerciseGroupStringMapSecondary.keys()).filter(
              (item) => item !== group
            )
          );
          break;
        }
      }
    }
  };

  const handleExerciseGroupStringSecondaryChange = (
    exerciseGroupStringListSecondary: string[]
  ) => {
    if (exerciseGroupStringListSecondary.length === 0) {
      // If no Secondary Exercise Groups are selected
      setExercise((prev) => ({
        ...prev,
        exercise_group_set_string_secondary: null,
        exerciseGroupStringMapSecondary: undefined,
        formattedGroupStringSecondary: undefined,
      }));

      return;
    }

    const exerciseGroupMapSecondary = new Map<string, string>(
      exercise.exerciseGroupStringMapSecondary ?? []
    );

    const exerciseGroupSetString =
      ConvertExerciseGroupStringMapSecondaryToString(
        exerciseGroupStringListSecondary,
        exerciseGroupMapSecondary
      );

    const convertedValuesSecondary = ConvertExerciseGroupSetStringSecondary(
      exerciseGroupSetString
    );

    setExercise((prev) => ({
      ...prev,
      exercise_group_set_string_secondary: exerciseGroupSetString,
      exerciseGroupStringMapSecondary: convertedValuesSecondary.map,
      formattedGroupStringSecondary: convertedValuesSecondary.formattedString,
    }));
  };

  return (
    <Modal
      isOpen={exerciseModal.isOpen}
      onOpenChange={exerciseModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {exercise.id === 0 ? "New" : "Edit"} Exercise
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[440px]">
                <div className="flex flex-col gap-2 w-[23.75rem]">
                  <div className="flex flex-col gap-0.5">
                    <Input
                      className="h-[5rem]"
                      value={exercise.name}
                      isInvalid={!isExerciseNameValid}
                      label="Name"
                      errorMessage={
                        !isExerciseNameValid && "Name can't be empty"
                      }
                      variant="faded"
                      onValueChange={(value) =>
                        setExercise((prev) => ({ ...prev, name: value }))
                      }
                      isRequired
                      isClearable
                    />
                    <Input
                      value={exercise.note ?? ""}
                      label="Note"
                      variant="faded"
                      onValueChange={(value) =>
                        setExercise((prev) => ({ ...prev, note: value }))
                      }
                      isClearable
                    />
                  </div>
                  <div
                    aria-label="Primary Exercise Groups Accordion"
                    className="flex flex-col select-none cursor-pointer"
                  >
                    <div
                      className="flex relative cursor-pointer pl-1 pb-0.5"
                      onClick={() =>
                        setIsPrimaryAccordionExpanded(
                          !isPrimaryAccordionExpanded
                        )
                      }
                    >
                      <span
                        className={
                          isExerciseGroupSetPrimaryStringValid
                            ? "flex items-start font-medium"
                            : "flex items-start text-danger font-medium"
                        }
                      >
                        Primary Exercise Groups
                        <span className="text-sm text-danger pt-[1px] pl-0.5">
                          *
                        </span>
                      </span>
                      <div className="absolute top-1 right-0">
                        <ChevronIcon
                          size={31}
                          color="#a8a29e"
                          direction={
                            isPrimaryAccordionExpanded ? "down" : "left"
                          }
                        />
                      </div>
                    </div>
                    <AnimatePresence>
                      {isPrimaryAccordionExpanded ? (
                        <motion.div
                          className="px-1 pt-0.5"
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.1 },
                            opacity: { duration: 0.05 },
                          }}
                        >
                          <ExerciseGroupCheckboxes
                            isValid={isExerciseGroupSetPrimaryStringValid}
                            value={
                              exercise.exerciseGroupStringListPrimary ?? []
                            }
                            handleChange={
                              handleExerciseGroupStringPrimaryChange
                            }
                            exerciseGroupDictionary={exerciseGroupDictionary}
                          />
                        </motion.div>
                      ) : (
                        <motion.div className="px-1 text-xs w-[21rem]">
                          {exercise.formattedGroupStringPrimary === "" ? (
                            <span className="text-stone-400">
                              No Exercise Group(s) Selected
                            </span>
                          ) : (
                            <span>{exercise.formattedGroupStringPrimary}</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div
                    aria-label="Secondary Exercise Groups Accordion"
                    className="flex flex-col select-none"
                  >
                    <div
                      className="flex relative cursor-pointer pl-1 pb-0.5"
                      onClick={() =>
                        setIsSecondaryAccordionExpanded(
                          !isSecondaryAccordionExpanded
                        )
                      }
                    >
                      <span className="font-medium">
                        Secondary Exercise Groups
                      </span>
                      <div className="absolute top-1 right-0">
                        <ChevronIcon
                          size={31}
                          color="#a8a29e"
                          direction={
                            isSecondaryAccordionExpanded ? "down" : "left"
                          }
                        />
                      </div>
                    </div>
                    <AnimatePresence>
                      {isSecondaryAccordionExpanded ? (
                        <motion.div
                          className="px-1 pt-0.5"
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.1 },
                            opacity: { duration: 0.05 },
                          }}
                        >
                          <ExerciseGroupCheckboxes
                            isValid={true}
                            value={Array.from(
                              exercise.exerciseGroupStringMapSecondary?.keys() ??
                                []
                            )}
                            handleChange={
                              handleExerciseGroupStringSecondaryChange
                            }
                            exerciseGroupDictionary={exerciseGroupDictionary}
                            disabledKeys={
                              exercise.exerciseGroupStringListPrimary
                            }
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          className="px-1 text-xs w-[21rem]"
                          style={{ height: "100%" }}
                        >
                          {exercise.formattedGroupStringSecondary ===
                          undefined ? (
                            <span className="text-stone-400">
                              No Exercise Group(s) Selected
                            </span>
                          ) : (
                            <span>
                              {exercise.formattedGroupStringSecondary}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {exercise.exerciseGroupStringMapSecondary !== undefined && (
                    <div
                      aria-label="Secondary Exercise Group Multipliers Accordion"
                      className="flex flex-col select-none"
                    >
                      <div
                        className="flex relative cursor-pointer pl-1 pb-0.5"
                        onClick={() =>
                          setIsMultiplierAccordionExpanded(
                            !isMultiplierAccordionExpanded
                          )
                        }
                      >
                        <span className="font-medium">
                          Secondary Multipliers
                        </span>
                        <div className="absolute right-0">
                          <ChevronIcon
                            size={31}
                            color="#a8a29e"
                            direction={
                              isMultiplierAccordionExpanded ? "down" : "left"
                            }
                          />
                        </div>
                      </div>
                      <AnimatePresence>
                        {isMultiplierAccordionExpanded && (
                          <motion.div
                            className="grid grid-cols-2 gap-x-5 gap-y-1 px-1 pt-1.5"
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: { duration: 0.1 },
                              opacity: { duration: 0.05 },
                            }}
                          >
                            {Array.from(
                              exercise.exerciseGroupStringMapSecondary
                            ).map(([key, value]) => {
                              const exerciseGroup =
                                exerciseGroupDictionary.get(key);

                              return (
                                <div className="flex gap-2 items-center">
                                  <span className="text-sm w-[6.5rem]">
                                    {exerciseGroup}
                                  </span>
                                  <Input
                                    aria-label={`${exerciseGroup} Multiplier Input`}
                                    className="w-[3.25rem]"
                                    size="sm"
                                    value={value}
                                    variant="faded"
                                    // onValueChange={(value) => {}}
                                    // isInvalid={}
                                  />
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={buttonAction}
                isDisabled={
                  !isExerciseNameValid || !isExerciseGroupSetPrimaryStringValid
                }
              >
                {exercise.id !== 0 ? "Save" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
