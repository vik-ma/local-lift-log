import { useParams } from "react-router-dom";
import { WorkoutSet, WorkoutTemplate, GroupedWorkoutSet } from "../typings";
import { useState, useEffect, useCallback } from "react";
import { useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import {
  LoadingSpinner,
  DeleteModal,
  SetModal,
  WorkoutExerciseList,
  WorkoutTemplateModal,
  DetailsHeader,
} from "../components";
import { Toaster } from "react-hot-toast";
import {
  CreateGroupedWorkoutSetList,
  ConvertEmptyStringToNull,
  UpdateWorkoutTemplate,
} from "../helpers";
import {
  useValidateName,
  useDefaultWorkoutTemplate,
  useWorkoutActions,
  useExerciseList,
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
    workoutNumbers,
    multisetTypeMap,
  } = useWorkoutActions(true);

  const exerciseList = useExerciseList();

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
        await CreateGroupedWorkoutSetList(
          setList,
          workoutTemplate.exercise_order
        );

      workoutNumbers.numExercises = groupedSetList.length;
      workoutNumbers.numSets = setList.length;

      for (let i = 0; i < groupedSetList.length; i++) {
        groupedSetList[i].showExerciseNote = true;
      }

      setWorkoutTemplate(workoutTemplate);
      setEditedWorkoutTemplate(workoutTemplate);
      setGroupedSets(groupedSetList);
    } catch (error) {
      console.log(error);
    }
  }, [id, setGroupedSets, setWorkoutTemplate, workoutNumbers]);

  useEffect(() => {
    getWorkoutTemplateAndSetList();
  }, [id, getWorkoutTemplateAndSetList]);

  const updateWorkoutTemplate = async () => {
    if (!isNewWorkoutTemplateNameValid) return;

    const noteToInsert = ConvertEmptyStringToNull(editedWorkoutTemplate.note);

    const updatedWorkoutTemplate: WorkoutTemplate = {
      ...editedWorkoutTemplate,
      note: noteToInsert,
    };

    const success = await UpdateWorkoutTemplate(updatedWorkoutTemplate);

    if (!success) return;

    setWorkoutTemplate(updatedWorkoutTemplate);
    setEditedWorkoutTemplate(updatedWorkoutTemplate);
    workoutTemplateModal.onClose();
  };

  if (workoutTemplate.id === 0 || userSettings === undefined)
    return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <WorkoutTemplateModal
        workoutTemplateModal={workoutTemplateModal}
        workoutTemplate={editedWorkoutTemplate}
        setWorkoutTemplate={setEditedWorkoutTemplate}
        isWorkoutTemplateNameValid={isNewWorkoutTemplateNameValid}
        buttonAction={updateWorkoutTemplate}
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
              ? `Are you sure you want to remove all ${operatingGroupedSet?.exerciseList[0].name} sets from Workout Template?`
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
        useSetTrackingInputs={operatingSetInputs}
        isSetTrackingValuesInvalid={
          operatingSetInputs.isSetTrackingValuesInvalid
        }
        handleSaveSetButton={handleSaveSetButton}
        clearSetInputValues={clearSetInputValues}
        userSettings={userSettings}
        exerciseList={exerciseList}
      />
      <div className="flex flex-col">
        <DetailsHeader
          header={workoutTemplate.name}
          subHeader={`${workoutNumbers.numExercises} Exercises, ${workoutNumbers.numSets} Sets`}
          note={workoutTemplate.note}
          editButtonAction={() => workoutTemplateModal.onOpen()}
        />
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
          multisetTypeMap={multisetTypeMap}
        />
      </div>
    </>
  );
}
