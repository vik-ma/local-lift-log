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
import { useRoutineScheduleTypeMap } from "../../hooks";

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
