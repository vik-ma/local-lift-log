import { useParams } from "react-router-dom";
import {
  Routine,
  WorkoutTemplateListItem,
  RoutineScheduleItem,
  UserSettingsOptional,
} from "../typings";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Listbox,
  ListboxItem,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { NotFound } from ".";
import Database from "tauri-plugin-sql-api";
import LoadingSpinner from "../components/LoadingSpinner";
import { GetScheduleDayNames } from "../helpers/Routines/GetScheduleDayNames";
import { GetScheduleDayValues } from "../helpers/Routines/GetScheduleValues";
import toast, { Toaster } from "react-hot-toast";
import { NumDaysInScheduleOptions } from "../helpers/Routines/NumDaysInScheduleOptions";
import { UpdateActiveRoutineId } from "../helpers/UserSettings/UpdateActiveRoutineId";
import { GetActiveRoutineId } from "../helpers/UserSettings/GetActiveRoutineId";
import Calendar from "react-calendar";
import { ConvertDateToYmdString } from "../helpers/Dates/ConvertDateToYmdString";

export default function RoutineDetailsPage() {
  const { id } = useParams();
  const [routine, setRoutine] = useState<Routine>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedRoutine, setEditedRoutine] = useState<Routine>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [scheduleValues, setScheduleValues] = useState<RoutineScheduleItem[][]>(
    []
  );
  const [workoutTemplateScheduleToRemove, setWorkoutTemplateScheduleToRemove] =
    useState<RoutineScheduleItem>();
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [newCustomStartDate, setNewCustomStartDate] = useState<string>("");

  const numDaysInScheduleOptions: number[] = NumDaysInScheduleOptions;

  const isNewRoutineNameInvalid = useMemo(() => {
    return (
      editedRoutine?.name === null ||
      editedRoutine?.name === undefined ||
      editedRoutine?.name.trim().length === 0
    );
  }, [editedRoutine?.name]);

  const deleteModal = useDisclosure();
  const workoutTemplatesModal = useDisclosure();
  const calendarModal = useDisclosure();

  const getWorkoutTemplateSchedules = useCallback(async () => {
    if (routine?.num_days_in_schedule === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<RoutineScheduleItem[]>(
        `SELECT workout_template_schedules.id, day, workout_template_id,
        (SELECT name FROM workout_templates WHERE id = workout_template_schedules.workout_template_id) AS name
        FROM workout_template_schedules 
        WHERE routine_id = $1`,
        [id]
      );

      const schedules: RoutineScheduleItem[] = result.map((row) => ({
        id: row.id,
        day: row.day,
        workout_template_id: row.workout_template_id,
        name: row.name,
      }));

      const workoutScheduleStringList: RoutineScheduleItem[][] =
        GetScheduleDayValues(routine?.num_days_in_schedule, schedules);

      setScheduleValues(workoutScheduleStringList);
    } catch (error) {
      console.log(error);
    }
  }, [id, routine?.num_days_in_schedule]);

  useEffect(() => {
    const getRoutine = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Routine[]>(
          "SELECT * FROM routines WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const currentRoutine: Routine = result[0];
        setRoutine(currentRoutine);
        setEditedRoutine(currentRoutine);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    const getWorkoutTemplates = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplateListItem[]>(
          "SELECT id, name FROM workout_templates"
        );

        const templates: WorkoutTemplateListItem[] = result.map((row) => ({
          id: row.id,
          name: row.name,
        }));

        setWorkoutTemplates(templates);
      } catch (error) {
        console.log(error);
      }
    };

    const getActiveRoutineId = async () => {
      const userSettings: UserSettingsOptional | undefined =
        await GetActiveRoutineId();

      if (userSettings !== undefined) setUserSettings(userSettings);
    };

    getRoutine();
    getWorkoutTemplates();
    getWorkoutTemplateSchedules();
    getActiveRoutineId();
  }, [id, getWorkoutTemplateSchedules]);

  const updateRoutine = async () => {
    if (!isEditedRoutineValid()) return;

    try {
      if (routine === undefined || editedRoutine === undefined) return;

      const noteToInsert: string | null =
        editedRoutine.note?.trim().length === 0 ? null : editedRoutine.note;

      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE routines SET name = $1, note = $2, is_schedule_weekly = $3, num_days_in_schedule = $4 WHERE id = $5",
        [
          editedRoutine.name,
          noteToInsert,
          editedRoutine.is_schedule_weekly,
          editedRoutine.num_days_in_schedule,
          routine.id,
        ]
      );

      setRoutine((prev) => ({
        ...prev!,
        name: editedRoutine.name,
        note: editedRoutine.note,
        is_schedule_weekly: editedRoutine.is_schedule_weekly,
        num_days_in_schedule: editedRoutine.num_days_in_schedule,
      }));

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const isEditedRoutineValid = (): boolean => {
    if (editedRoutine === undefined) return false;

    if (editedRoutine.name === null || editedRoutine.name.trim().length === 0)
      return false;

    if (
      editedRoutine.is_schedule_weekly &&
      editedRoutine.num_days_in_schedule !== 7
    )
      return false;

    if (
      editedRoutine.num_days_in_schedule < 2 ||
      editedRoutine.num_days_in_schedule > 14
    )
      return false;

    return true;
  };

  const handleAddWorkoutButtonPress = (day: number) => {
    setSelectedDay(day);
    workoutTemplatesModal.onOpen();
  };

  const addWorkoutTemplateToDay = async (workoutTemplateIdString: string) => {
    const workoutTemplateId: number = parseInt(workoutTemplateIdString);

    if (
      routine === undefined ||
      isNaN(workoutTemplateId) ||
      selectedDay < 0 ||
      selectedDay > routine?.num_days_in_schedule - 1
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "INSERT into workout_template_schedules (day, workout_template_id, routine_id) VALUES ($1, $2, $3)",
        [selectedDay, workoutTemplateId, routine.id]
      );

      await getWorkoutTemplateSchedules();

      workoutTemplatesModal.onClose();
      toast.success(`Workout added to ${dayNameList[selectedDay]}`);
    } catch (error) {
      console.log(error);
    }
  };

  const removeWorkoutTemplateFromDay = async () => {
    if (routine === undefined || workoutTemplateScheduleToRemove === undefined)
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute("DELETE from workout_template_schedules WHERE id = $1", [
        workoutTemplateScheduleToRemove.id,
      ]);

      await getWorkoutTemplateSchedules();

      deleteModal.onClose();
      toast.success(
        `${workoutTemplateScheduleToRemove.name} removed from ${dayNameList[selectedDay]}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveButtonPressed = (schedule: RoutineScheduleItem) => {
    setSelectedDay(schedule.day);
    setWorkoutTemplateScheduleToRemove(schedule);
    deleteModal.onOpen();
  };

  const handleScheduleTypeChange = (scheduleType: string) => {
    if (scheduleType === "weekly") {
      setEditedRoutine((prev) => ({
        ...prev!,
        is_schedule_weekly: 1,
        num_days_in_schedule: 7,
      }));
    } else setEditedRoutine((prev) => ({ ...prev!, is_schedule_weekly: 0 }));
  };

  const handleNumDaysInScheduleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (editedRoutine?.is_schedule_weekly) return;

    const numDays: number = parseInt(e.target.value);

    if (isNaN(numDays) || numDays < 2 || numDays > 14) return;

    setEditedRoutine((prev) => ({ ...prev!, num_days_in_schedule: numDays }));
  };

  const handleSetActiveButtonPress = async () => {
    if (routine === undefined || userSettings === undefined) return;

    const updatedSettings: UserSettingsOptional = {
      ...userSettings,
      active_routine_id: routine.id,
    };

    await UpdateActiveRoutineId(updatedSettings);

    setUserSettings(updatedSettings);
  };

  const handleSelectCustomStartDate = async (selectedDate: Date) => {
    if (routine === undefined) return;

    const formattedDate = ConvertDateToYmdString(selectedDate);

    setNewCustomStartDate(formattedDate);
  };

  if (routine === undefined) return NotFound();

  const dayNameList: string[] = GetScheduleDayNames(
    routine?.num_days_in_schedule,
    routine?.is_schedule_weekly === 1 ? true : false
  );

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
                <h2>
                  Remove Workout Template from{" "}
                  <span className="text-success">
                    {dayNameList[selectedDay]}
                  </span>
                </h2>
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to remove{" "}
                  {workoutTemplateScheduleToRemove?.name}?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={removeWorkoutTemplateFromDay}>
                  Remove
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={workoutTemplatesModal.isOpen}
        onOpenChange={workoutTemplatesModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-1.5">
                <h2>
                  Add Workout Template to{" "}
                  <span className="text-success">
                    {dayNameList[selectedDay]}
                  </span>
                </h2>
              </ModalHeader>
              <ModalBody>
                <Listbox
                  aria-label="Workout Template List"
                  onAction={(key) => addWorkoutTemplateToDay(key.toString())}
                >
                  {workoutTemplates.map((template) => (
                    <ListboxItem
                      key={`${template.id}`}
                      className="text-success"
                      color="success"
                      variant="faded"
                    >
                      {template.name}
                    </ListboxItem>
                  ))}
                </Listbox>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={calendarModal.isOpen}
        onOpenChange={calendarModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Pick Custom Schedule Start Date
              </ModalHeader>
              <ModalBody>
                <Calendar
                  value={newCustomStartDate}
                  onClickDay={(value) => handleSelectCustomStartDate(value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="success">Select</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
              <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
                {routine?.name}
              </h1>
            </div>
            <div className="flex justify-center">
              {userSettings?.active_routine_id === routine.id ? (
                <span className="text-xl text-success font-semibold">
                  Currently Active Routine
                </span>
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg text-danger font-semibold">
                    Currently Not Active Routine
                  </span>
                  <Button
                    size="sm"
                    color="primary"
                    onPress={handleSetActiveButtonPress}
                  >
                    Set Active
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl">
                <span className="font-semibold">Note:</span> {routine?.note}
              </h2>
            </div>
            {isEditing ? (
              <div className="flex flex-col justify-center gap-2">
                <Input
                  value={editedRoutine?.name}
                  isInvalid={isNewRoutineNameInvalid}
                  label="Name"
                  errorMessage={
                    isNewRoutineNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) =>
                    setEditedRoutine((prev) => ({ ...prev!, name: value }))
                  }
                  isRequired
                  isClearable
                />
                <Input
                  value={editedRoutine?.note ?? ""}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) =>
                    setEditedRoutine((prev) => ({ ...prev!, note: value }))
                  }
                  isClearable
                />
                <div className="flex justify-between items-center px-1 gap-4">
                  <RadioGroup
                    value={
                      editedRoutine?.is_schedule_weekly ? "weekly" : "custom"
                    }
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
                    selectedKeys={[
                      editedRoutine!.num_days_in_schedule.toString(),
                    ]}
                    onChange={handleNumDaysInScheduleChange}
                    className={
                      editedRoutine?.is_schedule_weekly
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
                <div className="flex justify-center gap-4">
                  <Button color="danger" onPress={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button color="success" onPress={updateRoutine}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button color="primary" onPress={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
            )}
          </>
        )}
        <div>
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">
              {routine.is_schedule_weekly === 0
                ? `${routine.num_days_in_schedule} Day Schedule`
                : "Weekly Schedule"}
            </h2>
            {routine.is_schedule_weekly === 0 && (
              <Button
                size="sm"
                color="primary"
                onPress={() => calendarModal.onOpen()}
              >
                Pick StartDate
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-0.5 py-1">
            {Array.from(Array(routine.num_days_in_schedule), (_, i) => (
              <div
                key={`day-${i + 1}`}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col w-48 gap-1">
                  <span className="font-medium">{dayNameList[i]}</span>
                  {scheduleValues[i]?.length > 0 ? (
                    scheduleValues[i].map((schedule) => {
                      return (
                        <div
                          key={`${schedule.id}`}
                          className="flex justify-between items-center"
                        >
                          <span>{schedule.name}</span>
                          <Button
                            className="text-sm"
                            size="sm"
                            color="danger"
                            onPress={() => {
                              handleRemoveButtonPressed(schedule);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-stone-400">No workout</div>
                  )}
                </div>
                <Button
                  color="success"
                  onPress={() => handleAddWorkoutButtonPress(i)}
                >
                  Add Workout
                </Button>
              </div>
            ))}
            d
          </div>
        </div>
      </div>
    </>
  );
}
