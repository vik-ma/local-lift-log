import { useParams } from "react-router-dom";
import {
  ExerciseWithGroupString,
  UserSettingsOptional,
  WorkoutSet,
  WorkoutTemplate,
} from "../typings";
import { useState, useMemo, useEffect } from "react";
import {
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  ScrollShadow,
  Checkbox,
} from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import LoadingSpinner from "../components/LoadingSpinner";
import { NotFound } from ".";
import toast, { Toaster } from "react-hot-toast";
import {
  GetDefaultUnitValues,
  GetExerciseListWithGroupStrings,
} from "../helpers";
import { SearchIcon } from "../assets";

export default function WorkoutTemplateDetails() {
  const { id } = useParams();
  const [workoutTemplate, setWorkoutTemplate] = useState<WorkoutTemplate>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newWorkoutTemplateName, setNewWorkoutTemplateName] =
    useState<string>("");
  const [newWorkoutTemplateNote, setNewWorkoutTemplateNote] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [newSetTrackingOption, setNewSetTrackingOption] =
    useState<string>("weight");
  const [exercises, setExercises] = useState<ExerciseWithGroupString[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseWithGroupString>();

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "") {
      return exercises.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.exercise_group_string
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return exercises;
  }, [exercises, filterQuery]);

  const defaultNewSet: WorkoutSet = {
    id: 0,
    workout_id: 0,
    exercise_id: 0,
    is_template: 1,
    workout_template_id: 0,
    note: null,
    comment: null,
    is_completed: 0,
    time_completed: null,
    is_warmup: 0,
    weight: 0,
    reps: 0,
    rir: 0,
    rpe: 0,
    time_in_seconds: 0,
    distance: 0,
    resistance_level: 0,
    is_tracking_weight: 1,
    is_tracking_reps: 1,
    is_tracking_rir: 0,
    is_tracking_rpe: 0,
    is_tracking_time: 0,
    is_tracking_distance: 0,
    is_tracking_resistance_level: 0,
    weight_unit: "",
    distance_unit: "",
  };

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultNewSet);

  const newSetModal = useDisclosure();

  const isNewWorkoutTemplateNameInvalid = useMemo(() => {
    return (
      newWorkoutTemplateName === null ||
      newWorkoutTemplateName === undefined ||
      newWorkoutTemplateName.trim().length === 0
    );
  }, [newWorkoutTemplateName]);

  useEffect(() => {
    const getWorkoutTemplate = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplate[]>(
          "SELECT * FROM workout_templates WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const currentWorkoutTemplate: WorkoutTemplate = result[0];
        setWorkoutTemplate(currentWorkoutTemplate);
        setNewWorkoutTemplateName(currentWorkoutTemplate.name);
        setNewWorkoutTemplateNote(currentWorkoutTemplate.note ?? "");
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    const loadUserSettings = async () => {
      try {
        const userSettings = await GetDefaultUnitValues();
        if (userSettings === undefined) return;
        setUserSettings(userSettings);
        setOperatingSet((prev) => ({
          ...prev,
          weight_unit: userSettings.default_unit_weight!,
          distance_unit: userSettings.default_unit_distance!,
        }));
      } catch (error) {
        console.log(error);
      }
    };

    const getExerciseList = async () => {
      const exercises = await GetExerciseListWithGroupStrings();
      if (exercises !== undefined) setExercises(exercises);
    };

    getWorkoutTemplate();
    loadUserSettings();
    getExerciseList();
  }, [id]);

  const updateWorkoutTemplateNoteAndName = async () => {
    if (isNewWorkoutTemplateNameInvalid) return;

    try {
      if (workoutTemplate === undefined) return;

      const noteToInsert: string | null =
        newWorkoutTemplateNote.trim().length === 0
          ? null
          : newWorkoutTemplateNote;

      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE workout_templates SET name = $1, note = $2 WHERE id = $3",
        [newWorkoutTemplateName, noteToInsert, workoutTemplate.id]
      );

      setWorkoutTemplate((prev) => ({
        ...prev!,
        name: newWorkoutTemplateName,
        note: newWorkoutTemplateNote,
      }));

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeSetTrackingOption = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value: string = e.target.value;
    setNewSetTrackingOption(value);

    if (value === "weight") {
      setOperatingSet((prev) => ({
        ...prev,
        is_tracking_weight: 1,
        is_tracking_reps: 1,
        is_tracking_distance: 0,
        is_tracking_time: 0,
        is_tracking_rir: 0,
        is_tracking_rpe: 0,
        is_tracking_resistance_level: 0,
      }));
    }

    if (value === "distance") {
      setOperatingSet((prev) => ({
        ...prev,
        is_tracking_weight: 0,
        is_tracking_reps: 0,
        is_tracking_distance: 1,
        is_tracking_time: 1,
        is_tracking_rir: 0,
        is_tracking_rpe: 0,
        is_tracking_resistance_level: 0,
      }));
    }
  };

  if (workoutTemplate === undefined) return NotFound();

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Modal
        isOpen={newSetModal.isOpen}
        onOpenChange={newSetModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedExercise === undefined
                  ? "Select Exercise"
                  : "Tracking Options"}
              </ModalHeader>
              <ModalBody>
                {selectedExercise === undefined ? (
                  <div className="h-[400px] flex flex-col gap-2">
                    <Input
                      label="Search"
                      variant="faded"
                      placeholder="Type to search..."
                      isClearable
                      value={filterQuery}
                      onValueChange={setFilterQuery}
                      startContent={<SearchIcon />}
                    />
                    <ScrollShadow className="flex flex-col gap-1">
                      {filteredExercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:bg-default-200 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          onClick={() => setSelectedExercise(exercise)}
                        >
                          <span className="text-md">{exercise.name}</span>
                          <span className="text-xs text-stone-500 text-left">
                            {exercise.exercise_group_string}
                          </span>
                        </button>
                      ))}
                    </ScrollShadow>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 h-[400px]">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold px-1">
                          {selectedExercise.name}
                        </h2>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => setSelectedExercise(undefined)}
                        >
                          Change Exercise
                        </Button>
                      </div>
                      <Select
                        label="Tracking Presets"
                        variant="faded"
                        selectedKeys={[newSetTrackingOption]}
                        onChange={(value) =>
                          handleChangeSetTrackingOption(value)
                        }
                      >
                        <SelectItem key="weight" value="weight">
                          Weight & Reps
                        </SelectItem>
                        <SelectItem key="distance" value="distance">
                          Distance & Time
                        </SelectItem>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2 px-1">
                      <h2 className="text-2xl font-semibold">
                        Values To Track
                      </h2>
                      <div className="grid grid-cols-2 gap-2">
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_weight ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_weight: value ? 1 : 0,
                            }))
                          }
                        >
                          Weight
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_reps ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_reps: value ? 1 : 0,
                            }))
                          }
                        >
                          Reps
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_distance ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_distance: value ? 1 : 0,
                            }))
                          }
                        >
                          Distance
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_time ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_time: value ? 1 : 0,
                            }))
                          }
                        >
                          Time
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_rir ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_rir: value ? 1 : 0,
                            }))
                          }
                        >
                          RIR
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_rpe ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_rpe: value ? 1 : 0,
                            }))
                          }
                        >
                          RPE
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_resistance_level
                              ? true
                              : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_resistance_level: value ? 1 : 0,
                            }))
                          }
                        >
                          Resistance Level
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={operatingSet.is_warmup ? true : false}
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_warmup: value ? 1 : 0,
                            }))
                          }
                        >
                          <span className="text-primary">Warmup Set</span>
                        </Checkbox>
                      </div>
                    </div>
                    <Input
                      value={operatingSet.note ?? ""}
                      label="Note"
                      variant="faded"
                      onValueChange={(value) =>
                        setOperatingSet((prev) => ({
                          ...prev,
                          note: value,
                        }))
                      }
                      isClearable
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  isDisabled={selectedExercise === undefined}
                  onPress={() => {}}
                >
                  Save
                </Button>
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
                {workoutTemplate.name}
              </h1>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Note</h2>
              <span>{workoutTemplate?.note}</span>
            </div>
            {isEditing ? (
              <div className="flex flex-col justify-center gap-2">
                <Input
                  value={newWorkoutTemplateName}
                  isInvalid={isNewWorkoutTemplateNameInvalid}
                  label="Name"
                  errorMessage={
                    isNewWorkoutTemplateNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) => setNewWorkoutTemplateName(value)}
                  isRequired
                  isClearable
                />
                <Input
                  value={newWorkoutTemplateNote!}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) => setNewWorkoutTemplateNote(value)}
                  isClearable
                />
                <div className="flex justify-center gap-4">
                  <Button color="danger" onPress={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    onPress={updateWorkoutTemplateNoteAndName}
                  >
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
            <div>
              <h2 className="text-xl font-semibold ">Set List</h2>
              <div className="flex justify-center">
                <Button color="success" onPress={() => newSetModal.onOpen()}>
                  Add Set
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
