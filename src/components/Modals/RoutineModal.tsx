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
import { useEffect, useMemo, useState } from "react";
import {
  ConvertEmptyStringToNull,
  ConvertNullToEmptyInputString,
  NumDaysInScheduleOptions,
} from "../../helpers";
import { useIsRoutineValid, useRoutineScheduleTypeMap } from "../../hooks";

type RoutineModalProps = {
  routineModal: UseDisclosureReturnType;
  routine: Routine;
  setRoutine: React.Dispatch<React.SetStateAction<Routine>>;
  buttonAction: (routine: Routine) => void;
};

export const RoutineModal = ({
  routineModal,
  routine,
  setRoutine,
  buttonAction,
}: RoutineModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");
  const [noteInput, setNoteInput] = useState<string>("");

  const { isRoutineNameValid, isRoutineValid } = useIsRoutineValid(routine);

  const numDaysInScheduleOptions: number[] = useMemo(() => {
    return NumDaysInScheduleOptions();
  }, []);

  const routineScheduleTypeMap = useRoutineScheduleTypeMap();

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

    const numDays: number = parseInt(e.target.value);

    if (isNaN(numDays) || numDays < 2 || numDays > 14) return;

    setRoutine((prev) => ({ ...prev, num_days_in_schedule: numDays }));
  };

  useEffect(() => {
    setNameInput(routine.name);
    setNoteInput(ConvertNullToEmptyInputString(routine.note));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine.id]);

  const handleSaveButton = () => {
    if (!isRoutineValid) return;

    const note = ConvertEmptyStringToNull(noteInput);

    const updatedRoutine: Routine = {
      ...routine,
      name: nameInput,
      note: note,
    };

    buttonAction(updatedRoutine);
  };

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
            <ModalBody>
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
                    value={
                      routineScheduleTypeMap.get(routine.schedule_type) ??
                      routineScheduleTypeMap.get(0)
                    }
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
                isDisabled={!isRoutineValid}
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
