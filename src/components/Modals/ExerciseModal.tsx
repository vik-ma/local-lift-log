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
import { Exercise, UseDisclosureReturnType } from "../../typings";
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
  buttonAction: () => void;
};

export const ExerciseModal = ({
  exerciseModal,
  exercise,
  setExercise,
  isExerciseNameValid,
  isExerciseGroupSetPrimaryStringValid,
  buttonAction,
}: ExerciseModalProps) => {
  const [isPrimaryAccordionExpanded, setIsPrimaryAccordionExpanded] =
    useState<boolean>(true);
  const [isSecondaryAccordionExpanded, setIsSecondaryAccordionExpanded] =
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
  };

  const handleExerciseGroupStringSecondaryChange = (
    exerciseGroupStringListSecondary: string[]
  ) => {
    if (exerciseGroupStringListSecondary.length === 0) {
      setExercise((prev) => ({
        ...prev,
        exercise_group_set_string_secondary: null,
        exerciseGroupStringMapSecondary: undefined,
        formattedGroupStringSecondary: undefined,
      }));
    } else {
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
    }
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
                <div className="flex flex-col gap-2.5 w-[23.75rem]">
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
                    onClick={() =>
                      setIsPrimaryAccordionExpanded(!isPrimaryAccordionExpanded)
                    }
                  >
                    <div className="flex justify-between items-center pl-1 pb-1.5">
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
                      <ChevronIcon
                        size={25}
                        color="#a8a29e"
                        direction={isPrimaryAccordionExpanded ? "down" : "left"}
                      />
                    </div>
                    <AnimatePresence>
                      {isPrimaryAccordionExpanded && (
                        <motion.div
                          className="px-1"
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
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div
                    aria-label="Primary Exercise Groups Accordion"
                    className="flex flex-col select-none cursor-pointer"
                    onClick={() =>
                      setIsSecondaryAccordionExpanded(
                        !isSecondaryAccordionExpanded
                      )
                    }
                  >
                    <div className="flex justify-between items-center pl-1 pb-1">
                      <span className="font-medium">
                        Secondary Exercise Groups
                      </span>
                      <ChevronIcon
                        size={25}
                        color="#a8a29e"
                        direction={
                          isSecondaryAccordionExpanded ? "down" : "left"
                        }
                      />
                    </div>
                    <AnimatePresence>
                      {isSecondaryAccordionExpanded && (
                        <motion.div
                          className="px-1"
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
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
