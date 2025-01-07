import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import {
  DietLog,
  UseDietLogEntryInputsReturnType,
  UseDisclosureReturnType,
} from "../../typings";
import { DietLogDayDropdown } from "../Dropdowns/DietLogDayDropdown";

type DietLogModalProps = {
  dietLogModal: UseDisclosureReturnType;
  operatingDietLog: DietLog;
  useDietLogEntryInputs: UseDietLogEntryInputsReturnType;
  buttonAction: () => void;
  latestDietLog?: DietLog | undefined;
};

export const DietLogModal = ({
  dietLogModal,
  operatingDietLog,
  useDietLogEntryInputs,
  buttonAction,
  latestDietLog,
}: DietLogModalProps) => {
  const {
    caloriesInput,
    setCaloriesInput,
    fatInput,
    setFatInput,
    carbsInput,
    setCarbsInput,
    proteinInput,
    setProteinInput,
    commentInput,
    setCommentInput,
    isCaloriesInputValid,
    isCarbsInputValid,
    isFatInputValid,
    isProteinInputValid,
    isDietLogEntryInputValid,
    targetDay,
    setTargetDay,
    calculateCaloriesFromMacros,
  } = useDietLogEntryInputs;

  const copyLastValues = () => {
    if (latestDietLog === undefined) return;

    setCaloriesInput(latestDietLog.calories.toString());

    if (latestDietLog.fat !== null) {
      setFatInput(latestDietLog.fat.toString());
    }
    if (latestDietLog.carbs !== null) {
      setCarbsInput(latestDietLog.carbs.toString());
    }
    if (latestDietLog.protein !== null) {
      setProteinInput(latestDietLog.protein.toString());
    }
  };

  return (
    <Modal
      isOpen={dietLogModal.isOpen}
      onOpenChange={dietLogModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {operatingDietLog.id === 0 ? "New" : "Edit"} Diet Log Entry
            </ModalHeader>
            <ModalBody>
              <div className="flex gap-6">
                <div className="flex flex-col gap-2 pt-[0.25rem] w-[12.5rem]">
                  <div className="flex flex-col gap-1.5">
                    <Input
                      value={caloriesInput}
                      label="Calories"
                      radius="lg"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) => setCaloriesInput(value)}
                      isInvalid={!isCaloriesInputValid}
                      isRequired
                      isClearable
                    />
                    <Input
                      value={commentInput}
                      label="Comment"
                      radius="lg"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) => setCommentInput(value)}
                      isClearable
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-medium px-0.5">
                      Macros
                      <span className="text-xs font-normal text-default-500">
                        {" "}
                        (grams)
                      </span>
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <Input
                        value={fatInput}
                        label="Fat"
                        radius="lg"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setFatInput(value)}
                        isInvalid={!isFatInputValid}
                        isClearable
                      />
                      <Input
                        value={carbsInput}
                        label="Carbohydrates"
                        radius="lg"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setCarbsInput(value)}
                        isInvalid={!isCarbsInputValid}
                        isClearable
                      />
                      <Input
                        value={proteinInput}
                        label="Protein"
                        radius="lg"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setProteinInput(value)}
                        isInvalid={!isProteinInputValid}
                        isClearable
                      />
                      <Button
                        className="mt-0.5"
                        color="secondary"
                        variant="flat"
                        size="sm"
                        onPress={calculateCaloriesFromMacros}
                      >
                        Calculate Calories From Macros
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-medium px-0.5">Diet Entry For Day</h3>
                    <DietLogDayDropdown
                      value={targetDay}
                      setState={setTargetDay}
                      targetType="state"
                    />
                  </div>
                  {operatingDietLog.id === 0 && latestDietLog !== undefined && (
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-medium text-lg px-0.5 border-b-1 text-stone-600">
                        Last Diet Log
                      </h3>
                      <div className="flex flex-col px-0.5 break-all w-[11rem] text-sm">
                        <div className="text-base">
                          <span className="font-semibold text-slate-500">
                            {latestDietLog.calories}{" "}
                          </span>
                          <span className="font-medium text-stone-600">
                            kcal
                          </span>
                        </div>
                        {latestDietLog.fat !== null && (
                          <div>
                            <span className="font-semibold text-stone-600">
                              Fat:{" "}
                            </span>
                            <span className="font-medium text-slate-500">
                              {latestDietLog.fat} g
                            </span>
                          </div>
                        )}
                        {latestDietLog.carbs !== null && (
                          <div>
                            <span className="font-semibold text-stone-600">
                              Carbs:{" "}
                            </span>
                            <span className="font-medium text-slate-500">
                              {latestDietLog.carbs} g
                            </span>
                          </div>
                        )}
                        {latestDietLog.protein !== null && (
                          <div>
                            <span className="font-semibold text-stone-600">
                              Protein:{" "}
                            </span>
                            <span className="font-medium text-slate-500">
                              {latestDietLog.protein} g
                            </span>
                          </div>
                        )}
                        {latestDietLog.comment !== null && (
                          <div className="text-stone-500 max-h-[7.5rem] overflow-hidden">
                            <span className="font-medium">Comment: </span>
                            {latestDietLog.comment}
                          </div>
                        )}
                      </div>
                      <Button
                        className="mt-0.5"
                        color="secondary"
                        variant="flat"
                        size="sm"
                        onPress={copyLastValues}
                      >
                        Copy Last Diet Log Values
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={buttonAction}
                isDisabled={!isDietLogEntryInputValid}
              >
                {operatingDietLog.id === 0 ? "Save" : "Update"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
