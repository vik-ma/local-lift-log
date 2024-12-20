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
} from "@nextui-org/react";
import { Routine, UseDisclosureReturnType } from "../../typings";
import { useMemo } from "react";
import { NumDaysInScheduleOptions } from "../../helpers";

type RoutineModalProps = {
  routineModal: UseDisclosureReturnType;
  routine: Routine;
  setRoutine: React.Dispatch<React.SetStateAction<Routine>>;
  isRoutineNameValid: boolean;
  buttonAction: () => void;
};

export const RoutineModal = ({
  routineModal,
  routine,
  setRoutine,
  isRoutineNameValid,
  buttonAction,
}: RoutineModalProps) => {
  const numDaysInScheduleOptions: number[] = useMemo(() => {
    return NumDaysInScheduleOptions();
  }, []);

  const handleScheduleTypeChange = (scheduleType: string) => {
    if (scheduleType === "weekly") {
      setRoutine((prev) => ({
        ...prev,
        is_schedule_weekly: 1,
        num_days_in_schedule: 7,
      }));
    } else setRoutine((prev) => ({ ...prev, is_schedule_weekly: 0 }));
  };

  const handleNumDaysInScheduleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (routine.is_schedule_weekly) return;

    const numDays: number = parseInt(e.target.value);

    if (isNaN(numDays) || numDays < 2 || numDays > 14) return;

    setRoutine((prev) => ({ ...prev, num_days_in_schedule: numDays }));
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
                    value={routine.name}
                    isInvalid={!isRoutineNameValid}
                    label="Name"
                    errorMessage={!isRoutineNameValid && "Name can't be empty"}
                    variant="faded"
                    onValueChange={(value) =>
                      setRoutine((prev) => ({ ...prev, name: value }))
                    }
                    isRequired
                    isClearable
                  />
                  <Input
                    value={routine.note ?? ""}
                    label="Note"
                    variant="faded"
                    onValueChange={(value) =>
                      setRoutine((prev) => ({ ...prev, note: value }))
                    }
                    isClearable
                  />
                </div>
                <div className="flex justify-between items-center px-1 py-0.5 gap-4">
                  <RadioGroup
                    value={routine.is_schedule_weekly ? "weekly" : "custom"}
                    onValueChange={(value) => handleScheduleTypeChange(value)}
                    defaultValue="weekly"
                    label="Schedule Type"
                  >
                    <Radio value="weekly">Weekly</Radio>
                    <Radio value="custom">Custom</Radio>
                  </RadioGroup>
                  <Select
                    isRequired
                    size="lg"
                    variant="faded"
                    label="Number of days in schedule"
                    labelPlacement="outside"
                    placeholder="Select number of days"
                    selectedKeys={[routine.num_days_in_schedule.toString()]}
                    onChange={handleNumDaysInScheduleChange}
                    className={
                      routine.is_schedule_weekly
                        ? "hidden max-w-[240px]"
                        : " max-w-[240px]"
                    }
                    disallowEmptySelection
                  >
                    {numDaysInScheduleOptions.map((number) => (
                      <SelectItem key={number} value={number}>
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
                onPress={buttonAction}
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
