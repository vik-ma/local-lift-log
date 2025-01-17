import { useParams } from "react-router-dom";
import {
  DetailHeaderOptionItem,
  WorkoutSet,
  WorkoutTemplate,
} from "../typings";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  CalculationModal,
  FilterExerciseGroupsModal,
  WorkoutTemplateListModal,
  FilterWorkoutTemplateListModal,
  FilterPresetsListModal,
  FilterMultisetListModal,
  GroupedWorkoutSetListModal,
} from "../components";
import toast from "react-hot-toast";
import {
  CreateGroupedWorkoutSetList,
  ConvertEmptyStringToNull,
  UpdateWorkoutTemplate,
  GetNumberOfUniqueExercisesInGroupedSets,
  FormatNumItemsString,
  UpdateExerciseOrder,
  CreateSetsFromWorkoutTemplate,
  MergeTwoGroupedSetLists,
  GenerateExerciseOrderString,
  GetTotalNumberOfSetsInGroupedSetList,
} from "../helpers";
import {
  useValidateName,
  useDefaultWorkoutTemplate,
  useWorkoutActions,
  useDetailsHeaderOptionsMenu,
  useWorkoutTemplateList,
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
    resetSetInputValues,
    groupedSets,
    setGroupedSets,
    userSettings,
    setUserSettings,
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
    presetsList,
    calculationModal,
    addCalculationResult,
    openCalculationModal,
    filterExerciseList,
    setWorkoutNumbers,
    groupedWorkoutSetListModal,
    mergeGroupedSets,
  } = useWorkoutActions(true);

  const workoutTemplateList = useWorkoutTemplateList(
    false,
    exerciseList,
    true,
    Number(id)
  );

  const { handleOpenWorkoutTemplateListModal, workoutTemplateListModal } =
    workoutTemplateList;

  const additionalMenuItems: DetailHeaderOptionItem = useMemo(() => {
    return {
      "copy-workout-template": {
        text: "Copy Workout Template",
        function: () => handleOpenWorkoutTemplateListModal(),
      },
    };
  }, [handleOpenWorkoutTemplateListModal]);

  const useDetailsHeaderOptions = useDetailsHeaderOptionsMenu(
    "Workout Template",
    additionalMenuItems
  );

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

      const { groupedSetList, shouldUpdateExerciseOrder } =
        await CreateGroupedWorkoutSetList(
          setList,
          workoutTemplate.exercise_order,
          exerciseList.exerciseGroupDictionary
        );

      if (shouldUpdateExerciseOrder) {
        const { success, exerciseOrderString } = await UpdateExerciseOrder(
          groupedSetList,
          Number(id),
          true
        );

        if (!success) return;

        workoutTemplate.exercise_order = exerciseOrderString;
      }

      workoutNumbers.numExercises =
        GetNumberOfUniqueExercisesInGroupedSets(groupedSetList);
      workoutNumbers.numSets = setList.length;

      setWorkoutTemplate(workoutTemplate);
      setEditedWorkoutTemplate(workoutTemplate);
      setGroupedSets(groupedSetList);
    } catch (error) {
      console.log(error);
    }
  }, [
    id,
    setGroupedSets,
    setWorkoutTemplate,
    workoutNumbers,
    exerciseList.exerciseGroupDictionary,
  ]);

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

  const handleClickWorkoutTemplate = async (
    workoutTemplateToCopy: WorkoutTemplate
  ) => {
    const newGroupedSets = await CreateSetsFromWorkoutTemplate(
      workoutTemplate.id,
      workoutTemplateToCopy.id,
      exerciseList.exerciseGroupDictionary,
      true
    );

    const updatedGroupedSetList = MergeTwoGroupedSetLists(
      groupedSets,
      newGroupedSets
    );

    const exerciseOrder = GenerateExerciseOrderString(updatedGroupedSetList);

    const updatedWorkoutTemplate: WorkoutTemplate = {
      ...workoutTemplate,
      exercise_order: exerciseOrder,
    };

    const success = await UpdateWorkoutTemplate(updatedWorkoutTemplate);

    if (!success) return;

    setWorkoutTemplate(updatedWorkoutTemplate);

    const workoutNumbers = {
      numSets: GetTotalNumberOfSetsInGroupedSetList(updatedGroupedSetList),
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(
        updatedGroupedSetList
      ),
    };

    setWorkoutNumbers(workoutNumbers);

    setGroupedSets(updatedGroupedSetList);

    toast.success("Workout Template Loaded");
    workoutTemplateListModal.onClose();
  };

  if (workoutTemplate.id === 0 || userSettings === undefined)
    return <LoadingSpinner />;

  return (
    <>
      <WorkoutTemplateModal
        workoutTemplateModal={workoutTemplateModal}
        workoutTemplate={editedWorkoutTemplate}
        setWorkoutTemplate={setEditedWorkoutTemplate}
        isWorkoutTemplateNameValid={isNewWorkoutTemplateNameValid}
        buttonAction={updateWorkoutTemplate}
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
                    {multisetActions.multisetTypeMap.get(
                      operatingGroupedSet.multiset!.multiset_type
                    )}
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
        resetSetInputValues={resetSetInputValues}
        userSettings={userSettings}
        exerciseList={exerciseList}
        numMultisetSets={numMultisetSets}
        openCalculationModal={openCalculationModal}
        useFilterExerciseList={filterExerciseList}
      />
      <MultisetModal
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
        handleClickMultiset={handleClickMultiset}
        showWorkoutItems={true}
        operatingSetInputs={operatingSetInputs}
        openCalculationModal={openCalculationModal}
        useFilterExerciseList={filterExerciseList}
      />
      <TextInputModal
        textInputModal={textInputModal}
        value={setCommentInput}
        setValue={setSetCommentInput}
        label="Note"
        header="Set Note"
        buttonAction={handleTextInputModalButton}
      />
      <GroupedWorkoutSetListModal
        groupedWorkoutSetListModal={groupedWorkoutSetListModal}
        operatingGroupedSet={operatingGroupedSet}
        groupedWorkoutSetList={groupedSets}
        multisetTypeMap={multisetActions.multisetTypeMap}
        onClickAction={mergeGroupedSets}
      />
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <WorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        onClickAction={handleClickWorkoutTemplate}
        header="Select Workout Template To Copy"
      />
      <FilterWorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        useExerciseList={exerciseList}
        userSettings={userSettings}
        useFilterExerciseList={filterExerciseList}
      />
      <FilterPresetsListModal
        usePresetsList={presetsList}
        userSettings={userSettings}
      />
      <FilterMultisetListModal
        useMultisetActions={multisetActions}
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
        userSettings={userSettings}
      />
      {userSettings.show_calculation_buttons === 1 && (
        <CalculationModal
          useCalculationModal={calculationModal}
          usePresetsList={presetsList}
          doneButtonAction={addCalculationResult}
          multiplierIncrement={
            userSettings.default_increment_calculation_multiplier
          }
          userSettings={userSettings}
          setUserSettings={setUserSettings}
        />
      )}
      <div className="flex flex-col">
        <DetailsHeader
          header={workoutTemplate.name}
          subHeader={`${FormatNumItemsString(
            workoutNumbers.numExercises,
            "Exercise"
          )}, ${FormatNumItemsString(workoutNumbers.numSets, "Set")}`}
          note={workoutTemplate.note}
          detailsType="Workout Template"
          editButtonAction={() => workoutTemplateModal.onOpen()}
          useDetailsHeaderOptions={useDetailsHeaderOptions}
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
