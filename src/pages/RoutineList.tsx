import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Routine, RoutineListItem, UserSettings } from "../typings";
import toast, { Toaster } from "react-hot-toast";
import Database from "tauri-plugin-sql-api";
import { UpdateUserSettings } from "../helpers/UserSettings/UpdateUserSettings";
import { GetUserSettings } from "../helpers/UserSettings/GetUserSettings";
import LoadingSpinner from "../components/LoadingSpinner";
import { NumDaysInScheduleOptions } from "../helpers/Routines/NumDaysInScheduleOptions";

export default function RoutineListPage() {
  const [routines, setRoutines] = useState<RoutineListItem[]>([]);
  const [routineToDelete, setRoutineToDelete] = useState<RoutineListItem>();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const defaultNewRoutine: Routine = {
    id: 0,
    name: "",
    note: "",
    is_schedule_weekly: 1,
    num_days_in_schedule: 7,
    custom_schedule_start_date: null,
  };

  const [newRoutine, setNewRoutine] = useState<Routine>(defaultNewRoutine);

  const numDaysInScheduleOptions: number[] = NumDaysInScheduleOptions;

  const deleteModal = useDisclosure();
  const newRoutineModal = useDisclosure();

  useEffect(() => {
    const getRoutines = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Routine[]>(
          "SELECT id, name FROM routines"
        );

        const routines: RoutineListItem[] = result.map((row) => ({
          id: row.id,
          name: row.name,
        }));

        setRoutines(routines);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    const loadUserSettings = async () => {
      const settings: UserSettings | undefined = await GetUserSettings();
      if (settings !== undefined) setUserSettings(settings);
    };

    loadUserSettings();
    getRoutines();
  }, []);

  const handleSetActiveButtonPress = async (routine: RoutineListItem) => {
    if (
      userSettings === undefined ||
      routine.id === userSettings.active_routine_id
    )
      return;

    const updatedSettings: UserSettings = {
      ...userSettings,
      active_routine_id: routine.id,
    };

    await updateUserSettings(updatedSettings);
  };

  const updateUserSettings = async (userSettings: UserSettings) => {
    await UpdateUserSettings(userSettings);
    setUserSettings(userSettings);
  };

  const handleDeleteButtonPress = (routine: RoutineListItem) => {
    setRoutineToDelete(routine);
    deleteModal.onOpen();
  };

  const addRoutine = async () => {
    if (!isNewRoutineValid()) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert: string | null =
        newRoutine.note?.trim().length === 0 ? null : newRoutine.note;

      const result = await db.execute(
        "INSERT into routines (name, note, is_schedule_weekly, num_days_in_schedule, custom_schedule_start_date) VALUES ($1, $2, $3, $4, $5)",
        [
          newRoutine.name,
          noteToInsert,
          newRoutine.is_schedule_weekly,
          newRoutine.num_days_in_schedule,
          newRoutine.custom_schedule_start_date,
        ]
      );

      const newRoutineListItem: RoutineListItem = {
        id: result.lastInsertId,
        name: newRoutine.name,
      };
      setRoutines([...routines, newRoutineListItem]);

      newRoutineModal.onClose();
      setNewRoutine(defaultNewRoutine);

      toast.success("Routine Created");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteRoutine = async () => {
    if (routineToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from routines WHERE id = $1", [routineToDelete.id]);

      // Delete all workout_template_schedules referencing routine
      db.execute(
        "DELETE from workout_template_schedules WHERE routine_id = $1",
        [routineToDelete.id]
      );

      const updatedRoutines: RoutineListItem[] = routines.filter(
        (item) => item.id !== routineToDelete?.id
      );
      setRoutines(updatedRoutines);

      if (routineToDelete.id === userSettings?.active_routine_id) {
        const updatedSettings: UserSettings = {
          ...userSettings,
          active_routine_id: 0,
        };

        await updateUserSettings(updatedSettings);
      }

      toast.success("Routine Deleted");
    } catch (error) {
      console.log(error);
    }

    setRoutineToDelete(undefined);
    deleteModal.onClose();
  };

  const isNewRoutineNameInvalid = useMemo(() => {
    return (
      newRoutine.name === null ||
      newRoutine.name === undefined ||
      newRoutine.name.trim().length === 0
    );
  }, [newRoutine.name]);

  const isNewRoutineValid = () => {
    if (newRoutine.name === null || newRoutine.name.trim().length === 0)
      return false;

    if (newRoutine.is_schedule_weekly && newRoutine.num_days_in_schedule !== 7)
      return false;

    if (
      newRoutine.num_days_in_schedule < 2 ||
      newRoutine.num_days_in_schedule > 14
    )
      return false;

    return true;
  };

  const handleScheduleTypeChange = (scheduleType: string) => {
    if (scheduleType === "weekly") {
      setNewRoutine((prev) => ({
        ...prev,
        is_schedule_weekly: 1,
        num_days_in_schedule: 7,
      }));
    } else setNewRoutine((prev) => ({ ...prev, is_schedule_weekly: 0 }));
  };

  const handleNumDaysInScheduleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (newRoutine.is_schedule_weekly) return;

    const numDays: number = parseInt(e.target.value);

    if (isNaN(numDays) || numDays < 2 || numDays > 14) return;

    setNewRoutine((prev) => ({ ...prev, num_days_in_schedule: numDays }));
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Routine
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to permanently delete{" "}
                  {routineToDelete?.name}?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteRoutine}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={newRoutineModal.isOpen}
        onOpenChange={newRoutineModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                New Routine
              </ModalHeader>
              <ModalBody>
                <Input
                  value={newRoutine.name}
                  isInvalid={isNewRoutineNameInvalid}
                  label="Name"
                  errorMessage={
                    isNewRoutineNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) =>
                    setNewRoutine((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  isClearable
                />
                <Input
                  value={newRoutine.note ?? ""}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) =>
                    setNewRoutine((prev) => ({ ...prev, note: value }))
                  }
                  isClearable
                />
                <div className="flex justify-between items-center px-1 gap-4">
                  <RadioGroup
                    value={newRoutine.is_schedule_weekly ? "weekly" : "custom"}
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
                    selectedKeys={[newRoutine.num_days_in_schedule.toString()]}
                    onChange={handleNumDaysInScheduleChange}
                    className={
                      newRoutine.is_schedule_weekly
                        ? "hidden max-w-[240px]"
                        : " max-w-[240px]"
                    }
                  >
                    {numDaysInScheduleOptions.map((number) => (
                      <SelectItem key={number} value={number}>
                        {number.toString()}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={addRoutine}
                  isDisabled={isNewRoutineNameInvalid}
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Routines
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              {routines.map((routine, index) => (
                <div
                  className="flex flex-row justify-stretch gap-1"
                  key={`routine-${index}`}
                >
                  <div className="w-[200px]">
                    <Button
                      className="w-full text-lg font-medium"
                      color="primary"
                      onPress={() => navigate(`/routines/${routine.id}`)}
                    >
                      {routine.name}
                    </Button>
                  </div>
                  <Button
                    color="success"
                    variant={
                      userSettings?.active_routine_id === routine.id
                        ? "flat"
                        : "light"
                    }
                    onPress={() => handleSetActiveButtonPress(routine)}
                  >
                    Set Active
                  </Button>
                  <Button
                    color="danger"
                    onPress={() => handleDeleteButtonPress(routine)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                className="text-lg font-medium"
                size="lg"
                color="success"
                onPress={() => newRoutineModal.onOpen()}
              >
                Create New Routine
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
