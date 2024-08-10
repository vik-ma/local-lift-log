import { useParams } from "react-router-dom";
import { WorkoutSet, WorkoutTemplate, GroupedWorkoutSet } from "../typings";
import { useState, useEffect, useCallback } from "react";
import { useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import {
  LoadingSpinner,
  DeleteModal,
  SetModal,
  WorkoutGroupedSetList,
  WorkoutTemplateModal,
  DetailsHeader,
  MultisetModal,
  TextInputModal,
} from "../components";
import { Toaster } from "react-hot-toast";
import {
  CreateGroupedWorkoutSetList,
  ConvertEmptyStringToNull,
  UpdateWorkoutTemplate,
  GetNumberOfUniqueExercisesInGroupedSets,
  FormatNumItemsString,
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
    handleGroupedSetOptionSelection,
    handleDeleteModalButton,
    updateShownSetListComments,
    handleGroupedSetAccordionClick,
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
    multisetActions,
    exerciseList,
    multisetModal,
    operatingMultiset,
    setOperatingMultiset,
    handleAddMultisetButton,
    handleSaveMultisetButton,
    handleClickExerciseMultiset,
    handleClickMultiset,
    handleToggleSetCommentButton,
    textInputModal,
    setCommentInput,
    setSetCommentInput,
    handleTextInputModalButton,
    numMultisetSets,
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
        await CreateGroupedWorkoutSetList(
          setList,
          workoutTemplate.exercise_order
        );

      workoutNumbers.numExercises =
        GetNumberOfUniqueExercisesInGroupedSets(groupedSetList);
      workoutNumbers.numSets = setList.length;

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
          operationType === "delete-grouped_sets-sets" ? "s" : ""
        }`}
        body={
          <p className="break-words">
            Are you sure you want to remove{" "}
            {operationType === "delete-grouped_sets-sets" ? (
              operatingGroupedSet?.isMultiset ? (
                <>
                  <span className="text-secondary">
                    {
                      multisetActions.multisetTypeMap[
                        operatingGroupedSet.multiset!.multiset_type
                      ].text
                    }
                  </span>{" "}
                  from Workout Template
                </>
              ) : (
                <>
                  all{" "}
                  <span className="text-secondary">
                    {operatingGroupedSet?.exerciseList[0].name}
                  </span>{" "}
                  sets from Workout Template
                </>
              )
            ) : (
              <>
                <span className="text-secondary">
                  {operatingSet.exercise_name}
                </span>{" "}
                set
              </>
            )}
            ?
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
        numMultisetSets={numMultisetSets}
      />
      <MultisetModal
        multisetModal={multisetModal}
        multiset={operatingMultiset}
        setMultiset={setOperatingMultiset}
        operatingSet={operatingSet}
        setOperatingSet={setOperatingSet}
        operationType={operationType}
        handleClickExercise={handleClickExerciseMultiset}
        useMultisetActions={multisetActions}
        exerciseList={exerciseList}
        userSettings={userSettings}
        saveButtonAction={handleSaveMultisetButton}
        updateOperatingSet={multisetActions.updateOperatingSet}
        handleClickMultiset={handleClickMultiset}
        showWorkoutItems={true}
        operatingSetInputs={operatingSetInputs}
        undoOperatingMultisetChanges={
          multisetActions.undoOperatingMultisetChanges
        }
      />
      <TextInputModal
        textInputModal={textInputModal}
        value={setCommentInput}
        setValue={setSetCommentInput}
        label="Note"
        header="Set Note"
        buttonAction={handleTextInputModalButton}
      />
      <div className="flex flex-col">
        <DetailsHeader
          header={workoutTemplate.name}
          subHeader={`${FormatNumItemsString(
            workoutNumbers.numExercises,
            "Exercise"
          )}, ${FormatNumItemsString(workoutNumbers.numSets, "Set")}`}
          note={workoutTemplate.note}
          editButtonAction={() => workoutTemplateModal.onOpen()}
        />
        <WorkoutGroupedSetList
          groupedSets={groupedSets}
          setGroupedSets={setGroupedSets}
          updateExerciseOrder={updateExerciseOrder}
          handleGroupedSetAccordionClick={handleGroupedSetAccordionClick}
          handleGroupedSetOptionSelection={handleGroupedSetOptionSelection}
          handleClickSet={handleClickSet}
          handleSetOptionSelection={handleSetOptionSelection}
          updateShownSetListComments={updateShownSetListComments}
          shownSetListComments={shownSetListComments}
          handleAddSetButton={handleAddSetButton}
          handleAddSetMultisetButton={handleAddMultisetButton}
          setIsExerciseBeingDragged={setIsExerciseBeingDragged}
          handleReassignExercise={handleReassignExercise}
          isTemplate={true}
          multisetTypeMap={multisetActions.multisetTypeMap}
          handleToggleSetCommentButton={handleToggleSetCommentButton}
        />
      </div>
    </>
  );
}
