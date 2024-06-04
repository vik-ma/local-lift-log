import { useParams } from "react-router-dom";
import { WorkoutSet, WorkoutTemplate, GroupedWorkoutSet } from "../typings";
import { useState, useEffect, useCallback } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import {
  LoadingSpinner,
  DeleteModal,
  SetModal,
  WorkoutExerciseList,
  WorkoutTemplateModal,
} from "../components";
import { Toaster } from "react-hot-toast";
import {
  CreateGroupedWorkoutSetListByExerciseId,
  ConvertEmptyStringToNull,
} from "../helpers";
import {
  useValidateName,
  useDefaultWorkoutTemplate,
  useWorkoutActions,
} from "../hooks";

export default function WorkoutTemplateDetails() {
  const { id } = useParams();

  const workoutTemplateModal = useDisclosure();

  const defaultNewWorkoutTemplate = useDefaultWorkoutTemplate();

  const [editedWorkoutTemplate, setEditedWorkoutTemplate] =
    useState<WorkoutTemplate>(defaultNewWorkoutTemplate);

  const isNewWorkoutTemplateNameValid = useValidateName(
    editedWorkoutTemplate.name
  );

  const {
    updateExerciseOrder,
    handleSaveSetButton,
    handleAddSetButton,
    handleClickExercise,
    handleClickSet,
    handleSetOptionSelection,
    handleExerciseOptionSelection,
    handleDeleteModalButton,
    updateShownSetListComments,
    handleExerciseAccordionClick,
    handleReassignExercise,
    clearSetInputValues,
    groupedSets,
    setGroupedSets,
    userSettings,
    operatingSet,
    setOperatingSet,
    operatingGroupedSet,
    deleteModal,
    setModal,
    operationType,
    selectedExercise,
    setSelectedExercise,
    operatingSetInputs,
    shownSetListComments,
    setIsExerciseBeingDragged,
    workoutTemplate,
    setWorkoutTemplate,
  } = useWorkoutActions(true);

  const getWorkoutTemplateAndSetList = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<WorkoutTemplate[]>(
        "SELECT * FROM workout_templates WHERE id = $1",
        [id]
      );

      if (result.length === 0) return;

      const workoutTemplate: WorkoutTemplate = result[0];

      const setList = await db.select<WorkoutSet[]>(
        `SELECT sets.*, 
        COALESCE(exercises.name, 'Unknown Exercise') AS exercise_name
        FROM sets LEFT JOIN 
        exercises ON sets.exercise_id = exercises.id 
        WHERE workout_template_id = $1 AND is_template = 1`,
        [id]
      );

      const groupedSetList: GroupedWorkoutSet[] =
        await CreateGroupedWorkoutSetListByExerciseId(
          setList,
          workoutTemplate.exercise_order
        );

      for (let i = 0; i < groupedSetList.length; i++) {
        groupedSetList[i].showExerciseNote = true;
      }

      setWorkoutTemplate(workoutTemplate);
      setEditedWorkoutTemplate(workoutTemplate);
      setGroupedSets(groupedSetList);
    } catch (error) {
      console.log(error);
    }
  }, [id, setGroupedSets, setWorkoutTemplate]);

  useEffect(() => {
    getWorkoutTemplateAndSetList();
  }, [id, getWorkoutTemplateAndSetList]);

  const updateWorkoutTemplateNoteAndName = async () => {
    if (!isNewWorkoutTemplateNameValid) return;

    const noteToInsert = ConvertEmptyStringToNull(editedWorkoutTemplate.note);

    const updatedWorkoutTemplate: WorkoutTemplate = {
      ...editedWorkoutTemplate,
      note: noteToInsert,
    };

    try {
      if (workoutTemplate === undefined) return;

      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE workout_templates SET name = $1, note = $2 WHERE id = $3",
        [
          updatedWorkoutTemplate.name,
          updatedWorkoutTemplate.note,
          updatedWorkoutTemplate.id,
        ]
      );

      setWorkoutTemplate(updatedWorkoutTemplate);
      setEditedWorkoutTemplate(updatedWorkoutTemplate);
      workoutTemplateModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  if (workoutTemplate === undefined || userSettings === undefined)
    return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <WorkoutTemplateModal
        workoutTemplateModal={workoutTemplateModal}
        workoutTemplate={editedWorkoutTemplate}
        setWorkoutTemplate={setEditedWorkoutTemplate}
        isWorkoutTemplateNameValid={isNewWorkoutTemplateNameValid}
        buttonAction={updateWorkoutTemplateNoteAndName}
        isEditing={true}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header={`Remove Set${
          operationType === "delete-exercise-sets" ? "s" : ""
        }`}
        body={
          <p className="break-words">
            {operationType === "delete-exercise-sets"
              ? `Are you sure you want to remove all ${operatingGroupedSet?.exercise.name} sets from Workout Template?`
              : `Are you sure you want to remove ${operatingSet.exercise_name} set?`}
          </p>
        }
        deleteButtonAction={handleDeleteModalButton}
        deleteButtonText={"Remove"}
      />
      <SetModal
        setModal={setModal}
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
        handleClickExercise={handleClickExercise}
        operationType={operationType}
        operatingSet={operatingSet}
        setOperatingSet={setOperatingSet}
        setTrackingValuesInput={operatingSetInputs.setTrackingValuesInput}
        setSetTrackingValuesInput={operatingSetInputs.setSetTrackingValuesInput}
        setInputsValidityMap={operatingSetInputs.setInputsValidityMap}
        isSetTrackingValuesInvalid={
          operatingSetInputs.isSetTrackingValuesInvalid
        }
        handleSaveSetButton={handleSaveSetButton}
        setIsTimeInputInvalid={operatingSetInputs.setIsTimeInputInvalid}
        defaultTimeInput={userSettings!.default_time_input!}
        time_input_behavior_hhmmss={userSettings!.time_input_behavior_hhmmss}
        time_input_behavior_mmss={userSettings!.time_input_behavior_mmss}
        clearSetInputValues={clearSetInputValues}
      />
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            {workoutTemplate.name}
          </h1>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Note</h2>
          <span>{workoutTemplate?.note}</span>
        </div>
        <div className="flex justify-center">
          <Button
            size="sm"
            color="success"
            onPress={() => workoutTemplateModal.onOpen()}
          >
            Edit
          </Button>
        </div>
        <WorkoutExerciseList
          groupedSets={groupedSets}
          setGroupedSets={setGroupedSets}
          updateExerciseOrder={updateExerciseOrder}
          handleExerciseAccordionClick={handleExerciseAccordionClick}
          handleExerciseOptionSelection={handleExerciseOptionSelection}
          handleClickSet={handleClickSet}
          handleSetOptionSelection={handleSetOptionSelection}
          updateShownSetListComments={updateShownSetListComments}
          shownSetListComments={shownSetListComments}
          handleAddSetButton={handleAddSetButton}
          setIsExerciseBeingDragged={setIsExerciseBeingDragged}
          handleReassignExercise={handleReassignExercise}
          isTemplate={true}
        />
      </div>
    </>
  );
}
