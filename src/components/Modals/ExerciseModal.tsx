import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
} from "@heroui/react";
import {
  Exercise,
  ExerciseGroupMap,
  UseDisclosureReturnType,
} from "../../typings";
import {
  ConvertExerciseGroupStringSetPrimaryToString,
  ConvertExerciseGroupSetStringPrimary,
  ConvertExerciseGroupSetStringSecondary,
  GenerateNewExerciseGroupSetStringSecondary,
  ConvertEmptyStringToNull,
} from "../../helpers";
import { ExerciseGroupCheckboxes } from "..";
import { useEffect, useRef, useState } from "react";
import { ChevronIcon } from "../../assets";
import { AnimatePresence, motion } from "framer-motion";
import {
  useValidateExerciseGroupStringPrimary,
  useValidateName,
} from "../../hooks";

type ExerciseModalProps = {
  exerciseModal: UseDisclosureReturnType;
  exercise: Exercise;
  setExercise: React.Dispatch<React.SetStateAction<Exercise>>;
  exerciseGroupDictionary: ExerciseGroupMap;
  multiplierInputMap: Map<string, string>;
  setMultiplierInputMap: React.Dispatch<
    React.SetStateAction<Map<string, string>>
  >;
  multiplierInputInvaliditySet: Set<string>;
  buttonAction: (exercise: Exercise) => void;
};

export const ExerciseModal = ({
  exerciseModal,
  exercise,
  setExercise,
  exerciseGroupDictionary,
  multiplierInputMap,
  setMultiplierInputMap,
  multiplierInputInvaliditySet,
  buttonAction,
}: ExerciseModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");
  const [noteInput, setNoteInput] = useState<string>("");
  const [isPrimaryAccordionExpanded, setIsPrimaryAccordionExpanded] =
    useState<boolean>(true);
  const [isSecondaryAccordionExpanded, setIsSecondaryAccordionExpanded] =
    useState<boolean>(false);
  const [isMultiplierAccordionExpanded, setIsMultiplierAccordionExpanded] =
    useState<boolean>(false);

  const isExerciseNameValid = useValidateName(nameInput);

  const secondaryAccordionRef = useRef<HTMLDivElement>(null);
  const multiplierAccordionRef = useRef<HTMLDivElement>(null);

  const hasPrimaryAccordionBeenClosed = useRef<boolean>(false);

  const isExerciseGroupSetPrimaryStringValid =
    useValidateExerciseGroupStringPrimary(
      exercise.exercise_group_set_string_primary,
      exerciseGroupDictionary
    );

  const handleClickPrimaryAccordion = () => {
    setIsPrimaryAccordionExpanded(!isPrimaryAccordionExpanded);

    if (!hasPrimaryAccordionBeenClosed.current) {
      hasPrimaryAccordionBeenClosed.current = true;
    }
  };

  useEffect(() => {
    const multiplierInputMap: Map<string, string> = new Map();

    if (exercise.exerciseGroupStringMapSecondary !== undefined) {
      for (const [key, value] of exercise.exerciseGroupStringMapSecondary) {
        multiplierInputMap.set(key, value);
      }
    }

    setMultiplierInputMap(multiplierInputMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.exerciseGroupStringMapSecondary]);

  const handleExerciseGroupStringPrimaryChange = (
    exerciseGroupStringListPrimary: string[]
  ) => {
    const exerciseGroupStringSetPrimary = new Set(
      exerciseGroupStringListPrimary
    );

    const exerciseGroupSetString = ConvertExerciseGroupStringSetPrimaryToString(
      exerciseGroupStringSetPrimary
    );

    const convertedValuesPrimary = ConvertExerciseGroupSetStringPrimary(
      exerciseGroupSetString,
      exerciseGroupDictionary
    );

    setExercise((prev) => ({
      ...prev,
      exercise_group_set_string_primary: exerciseGroupSetString,
      exerciseGroupStringSetPrimary: exerciseGroupStringSetPrimary,
      formattedGroupStringPrimary: convertedValuesPrimary.formattedString,
    }));

    if (exercise.exerciseGroupStringMapSecondary !== undefined) {
      for (const group of exerciseGroupStringSetPrimary) {
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
        exercise_group_map_string_secondary: null,
        exerciseGroupStringMapSecondary: undefined,
        formattedGroupStringSecondary: undefined,
      }));

      return;
    }

    const exerciseGroupMapSecondary = new Map<string, string>(
      exercise.exerciseGroupStringMapSecondary ?? []
    );

    const exerciseGroupSetString = GenerateNewExerciseGroupSetStringSecondary(
      exerciseGroupStringListSecondary,
      exerciseGroupMapSecondary
    );

    const convertedValuesSecondary = ConvertExerciseGroupSetStringSecondary(
      exerciseGroupSetString,
      exerciseGroupDictionary,
      exercise.exerciseGroupStringSetPrimary!
    );

    setExercise((prev) => ({
      ...prev,
      exercise_group_map_string_secondary: exerciseGroupSetString,
      exerciseGroupStringMapSecondary: convertedValuesSecondary.map,
      formattedGroupStringSecondary: convertedValuesSecondary.formattedString,
    }));
  };

  const handleMultiplierChange = (value: string, key: string) => {
    const updatedMultiplierInputMap = new Map(multiplierInputMap);

    updatedMultiplierInputMap.set(key, value);

    setMultiplierInputMap(updatedMultiplierInputMap);
  };

  useEffect(() => {
    if (isSecondaryAccordionExpanded) {
      setTimeout(() => {
        if (secondaryAccordionRef.current !== null) {
          secondaryAccordionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 105);
    }
  }, [isSecondaryAccordionExpanded]);

  useEffect(() => {
    if (isMultiplierAccordionExpanded) {
      setTimeout(() => {
        if (multiplierAccordionRef.current !== null) {
          multiplierAccordionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 105);
    }
  }, [isMultiplierAccordionExpanded]);

  useEffect(() => {
    setNameInput(exercise.name);
    setNoteInput(exercise.note ?? "");
  }, [exercise.name, exercise.note]);

  const exerciseGroupStringListPrimary: string[] =
    exercise.exerciseGroupStringSetPrimary !== undefined
      ? Array.from(exercise.exerciseGroupStringSetPrimary)
      : [];

  const handleSaveButton = () => {
    if (
      !isExerciseNameValid ||
      !isExerciseGroupSetPrimaryStringValid ||
      multiplierInputInvaliditySet.size > 0
    )
      return;

    const note = ConvertEmptyStringToNull(noteInput);

    const updatedExercise = { ...exercise, name: nameInput, note: note };

    buttonAction(updatedExercise);
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
                <div className="flex flex-col gap-3 w-[23.75rem]">
                  <div className="flex flex-col gap-0.5">
                    <Input
                      className="h-[5rem]"
                      value={nameInput}
                      isInvalid={!isExerciseNameValid}
                      label="Name"
                      errorMessage={
                        !isExerciseNameValid && "Name can't be empty"
                      }
                      variant="faded"
                      onValueChange={setNameInput}
                      isRequired
                      isClearable
                    />
                    <Input
                      value={noteInput}
                      label="Note"
                      variant="faded"
                      onValueChange={setNoteInput}
                      isClearable
                    />
                  </div>
                  <div
                    aria-label="Primary Exercise Groups Accordion"
                    className="flex flex-col select-none cursor-pointer"
                  >
                    <div
                      className="flex relative cursor-pointer pl-1 pb-0.5"
                      onClick={handleClickPrimaryAccordion}
                    >
                      <span
                        className={
                          isExerciseGroupSetPrimaryStringValid
                            ? "flex items-start font-medium text-lg"
                            : "flex items-start text-danger font-medium text-lg"
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
                      {isPrimaryAccordionExpanded && (
                        <motion.div
                          className="px-1 pt-0.5"
                          initial={
                            hasPrimaryAccordionBeenClosed.current
                              ? { height: 0, overflow: "hidden" }
                              : {}
                          }
                          animate={{ height: "auto" }}
                          exit={{ height: 0, overflow: "hidden" }}
                          transition={{
                            height: { duration: 0.1 },
                          }}
                        >
                          <ExerciseGroupCheckboxes
                            isValid={isExerciseGroupSetPrimaryStringValid}
                            value={exerciseGroupStringListPrimary}
                            handleChange={
                              handleExerciseGroupStringPrimaryChange
                            }
                            exerciseGroupDictionary={exerciseGroupDictionary}
                            customAriaLabel="Select Primary Exercise Groups"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!isPrimaryAccordionExpanded && (
                      <div className="px-1 text-sm w-[21rem] text-stone-500">
                        {exercise.formattedGroupStringPrimary === "" ? (
                          <span className="text-stone-400">
                            No Exercise Group(s) Selected
                          </span>
                        ) : (
                          <span>{exercise.formattedGroupStringPrimary}</span>
                        )}
                      </div>
                    )}
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
                      <span className="font-medium text-lg">
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
                      {isSecondaryAccordionExpanded && (
                        <motion.div
                          className="px-1 pt-0.5"
                          initial={{ height: 0, overflow: "hidden" }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0, overflow: "hidden" }}
                          transition={{
                            height: { duration: 0.1 },
                          }}
                          ref={secondaryAccordionRef}
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
                            customAriaLabel="Select Secondary Exercise Groups"
                            disabledKeys={exerciseGroupStringListPrimary}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!isSecondaryAccordionExpanded && (
                      <div className="px-1 text-sm w-[21rem] text-stone-500">
                        {exercise.formattedGroupStringSecondary ===
                        undefined ? (
                          <span className="text-stone-400">
                            No Exercise Group(s) Selected
                          </span>
                        ) : (
                          <span>{exercise.formattedGroupStringSecondary}</span>
                        )}
                      </div>
                    )}
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
                        <span className="font-medium text-lg">
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
                            className="px-1 pt-1.5"
                            initial={{ height: 0, overflow: "hidden" }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0, overflow: "hidden" }}
                            transition={{
                              height: { duration: 0.1 },
                            }}
                            ref={multiplierAccordionRef}
                          >
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              {Array.from(multiplierInputMap).map(
                                ([key, value]) => {
                                  const exerciseGroup =
                                    exerciseGroupDictionary.get(key);

                                  return (
                                    <div
                                      className="flex gap-2 items-center"
                                      key={`multiplier-input-${key}`}
                                    >
                                      <span className="text-sm w-[6.5rem]">
                                        {exerciseGroup}
                                      </span>
                                      <Input
                                        aria-label={`${exerciseGroup} Multiplier Input`}
                                        className="w-[3.25rem]"
                                        size="sm"
                                        value={value}
                                        variant="faded"
                                        onValueChange={(value) =>
                                          handleMultiplierChange(value, key)
                                        }
                                        isInvalid={multiplierInputInvaliditySet.has(
                                          key
                                        )}
                                      />
                                    </div>
                                  );
                                }
                              )}
                            </div>
                            <span className="text-xs text-stone-500">
                              Values must be between 0 and 1
                            </span>
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
                onPress={handleSaveButton}
                isDisabled={
                  !isExerciseNameValid ||
                  !isExerciseGroupSetPrimaryStringValid ||
                  multiplierInputInvaliditySet.size > 0
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
