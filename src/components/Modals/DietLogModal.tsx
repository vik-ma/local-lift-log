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
                      <h3 className="font-medium px-0.5 text-stone-500">Last Diet Log</h3>
                      <div className="flex flex-col gap-0.5 px-0.5 break-all w-[11rem] text-sm">
                        <div>
                          <span className="font-semibold">
                            {latestDietLog.calories}
                          </span>{" "}
                          kcal
                        </div>
                        {latestDietLog.fat !== null && (
                          <div>
                            <span className="font-semibold">Fat:</span>{" "}
                            {latestDietLog.fat} g
                          </div>
                        )}
                        {latestDietLog.carbs !== null && (
                          <div>
                            <span className="font-semibold">Carbs:</span>{" "}
                            {latestDietLog.carbs} g
                          </div>
                        )}
                        {latestDietLog.protein !== null && (
                          <div>
                            <span className="font-semibold">Protein:</span>{" "}
                            {latestDietLog.protein} g
                          </div>
                        )}
                        {latestDietLog.comment !== null && (
                          <div className="text-slate-500">
                            <span className="font-semibold">Comment:</span>{" "}
                            {latestDietLog.comment}
                          </div>
                        )}
                      </div>
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
