import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
} from "@heroui/react";
import { Routine, UseDisclosureReturnType } from "../../typings";
import { useEffect, useState } from "react";
import {
  ConvertEmptyStringToNull,
  ConvertNullToEmptyInputString,
  IsNumberValidInteger,
} from "../../helpers";
import { useValidateName } from "../../hooks";
import {
  NUM_DAYS_IN_SCHEDULE_OPTIONS,
  ROUTINE_SCHEDULE_TYPES,
} from "../../constants";

type RoutineModalProps = {
  routineModal: UseDisclosureReturnType;
  routine: Routine;
  setRoutine: React.Dispatch<React.SetStateAction<Routine>>;
  buttonAction: (routine: Routine) => void;
  resetInputsAfterSaving?: boolean;
};

export const RoutineModal = ({
  routineModal,
  routine,
  setRoutine,
  buttonAction,
  resetInputsAfterSaving,
}: RoutineModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");
  const [noteInput, setNoteInput] = useState<string>("");

  const isRoutineNameValid = useValidateName({ name: nameInput });

  const numDaysInScheduleOptions = NUM_DAYS_IN_SCHEDULE_OPTIONS;

  const routineScheduleTypeMap = ROUTINE_SCHEDULE_TYPES;

  const handleScheduleTypeChange = (scheduleType: string) => {
    if (scheduleType === "Weekly") {
      setRoutine((prev) => ({
        ...prev,
        schedule_type: 0,
        num_days_in_schedule: 7,
      }));
    } else if (scheduleType === "Custom") {
      setRoutine((prev) => ({
        ...prev,
        schedule_type: 1,
      }));
    } else {
      setRoutine((prev) => ({
        ...prev,
        schedule_type: 2,
      }));
    }
  };

  const handleNumDaysInScheduleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (routine.schedule_type !== 1) return;

    const numDays = Number(e.target.value);

    const minValue = 2;
    const doNotAllowMinValue = false;
    const maxValue = 14;

    if (!IsNumberValidInteger(numDays, minValue, doNotAllowMinValue, maxValue))
      return;

    setRoutine((prev) => ({ ...prev, num_days_in_schedule: numDays }));
  };

  const handleSaveButton = () => {
    if (!isRoutineNameValid) return;

    const note = ConvertEmptyStringToNull(noteInput);

    const updatedRoutine: Routine = {
      ...routine,
      name: nameInput,
      note: note,
    };

    buttonAction(updatedRoutine);

    if (resetInputsAfterSaving) resetInputs();
  };

  const resetInputs = () => {
    setNameInput("");
    setNoteInput("");
  };

  useEffect(() => {
    setNameInput(routine.name);
    setNoteInput(ConvertNullToEmptyInputString(routine.note));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine.id]);

  return (
    <Modal
      isOpen={routineModal.isOpen}
      onOpenChange={routineModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {routine.id === 0 ? "New" : "Edit"} Routine
            </ModalHeader>
            <ModalBody className="py-0">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-0.5">
                  <Input
                    className="h-[5rem]"
                    value={nameInput}
                    isInvalid={!isRoutineNameValid}
                    label="Name"
                    errorMessage={!isRoutineNameValid && "Name can't be empty"}
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
                <div className="flex justify-between items-center px-1 py-0.5 gap-4">
                  <RadioGroup
                    value={routineScheduleTypeMap.get(routine.schedule_type)}
                    onValueChange={(value) => handleScheduleTypeChange(value)}
                    label="Schedule Type"
                  >
                    {Array.from(routineScheduleTypeMap).map(([key, value]) => (
                      <Radio key={key} value={value}>
                        {value}
                      </Radio>
                    ))}
                  </RadioGroup>
                  <Select
                    className={
                      routine.schedule_type === 1 ? "w-[15rem]" : "hidden"
                    }
                    label={
                      <span className="text-default-500">
                        Number of days in schedule
                      </span>
                    }
                    labelPlacement="outside"
                    size="lg"
                    variant="faded"
                    selectedKeys={[routine.num_days_in_schedule.toString()]}
                    onChange={handleNumDaysInScheduleChange}
                    isRequired
                    disallowEmptySelection
                  >
                    {numDaysInScheduleOptions.map((number) => (
                      <SelectItem key={number.toString()}>
                        {number.toString()}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={handleSaveButton}
                isDisabled={!isRoutineNameValid}
              >
                {routine.id !== 0 ? "Save" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
