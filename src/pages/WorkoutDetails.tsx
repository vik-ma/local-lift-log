import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Workout, DetailHeaderOptionItem, WorkoutTemplate } from "../typings";
import {
  LoadingSpinner,
  WorkoutGroupedSetList,
  DeleteModal,
  SetModal,
  ActiveSet,
  WorkoutModal,
  TimeInputModal,
  DetailsHeader,
  MultisetModal,
  TextInputModal,
  UserWeightModal,
  WorkoutTemplateListModal,
  WorkoutListModal,
  CalculationModal,
  FilterWorkoutListModal,
  FilterExerciseGroupsModal,
  FilterWorkoutTemplateListModal,
  FilterRoutineListModal,
  FilterPresetsListModal,
  FilterMultisetListModal,
  GroupedWorkoutSetListModal,
} from "../components";
import Database from "tauri-plugin-sql-api";
import {
  CreateSetsFromWorkoutTemplate,
  CreateGroupedWorkoutSetList,
  GenerateExerciseOrderString,
  UpdateWorkout,
  GetNumberOfUniqueExercisesInGroupedSets,
  FormatNumItemsString,
  GetTotalNumberOfSetsInGroupedSetList,
  GetWorkoutSetList,
  GetExerciseOrder,
  MergeTwoGroupedSetLists,
  CopyWorkoutSetList,
  FormatDateString,
  UpdateExerciseOrder,
} from "../helpers";
import { useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  useDetailsHeaderOptionsMenu,
  useUserWeightInput,
  useWorkoutActions,
  useWorkoutList,
} from "../hooks";

type WorkoutTemplateNote = {
  note: string | null;
};

export default function WorkoutDetails() {
  const { id } = useParams();

  const workoutModal = useDisclosure();
  const userWeightModal = useDisclosure();

  const [workoutNote, setWorkoutNote] = useState<string>("");
  const [workoutTemplateNote, setWorkoutTemplateNote] = useState<string | null>(
    null
  );
  const [showWorkoutTemplateNote, setShowWorkoutTemplateNote] =
    useState<boolean>(false);

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
    workout,
    setWorkout,
    activeSet,
    setActiveSet,
    saveActiveSet,
    populateIncompleteSets,
    handleActiveSetOptionSelection,
    activeSetInputs,
    isActiveSetExpanded,
    setIsActiveSetExpanded,
    activeGroupedSet,
    activeSetNote,
    setActiveSetNote,
    handleEditSet,
    completedSetsMap,
    timeInputModal,
    updateSetTimeCompleted,
    workoutNumbers,
    setWorkoutNumbers,
    multisetActions,
    exerciseList,
    operatingMultiset,
    setOperatingMultiset,
    handleAddMultisetButton,
    handleSaveMultisetButton,
    handleClickExerciseMultiset,
    handleClickMultiset,
    textInputModal,
    setCommentInput,
    setSetCommentInput,
    handleTextInputModalButton,
    handleToggleSetCommentButton,
    numMultisetSets,
    userWeight,
    setUserWeight,
    populateUserWeightValues,
    isUserWeightOlderThanOneWeek,
    setIsUserWeightOlderThanOneWeek,
    presetsList,
    calculationModal,
    clearActiveSetInputValues,
    addCalculationResult,
    openCalculationModal,
    filterExerciseList,
    groupedWorkoutSetListModal,
    mergeGroupedSets,
  } = useWorkoutActions(false);

  const workoutList = useWorkoutList(false, exerciseList, true, Number(id));

  const {
    workoutTemplateList,
    routineList,
    handleOpenWorkoutListModal,
    workoutListModal,
  } = workoutList;

  const { handleOpenWorkoutTemplateListModal, workoutTemplateListModal } =
    workoutTemplateList;

  const additionalMenuItems: DetailHeaderOptionItem = useMemo(() => {
    return {
      "toggle-workout-template-note": {
        text: "Toggle Workout Template Note",
        function: () => setShowWorkoutTemplateNote(!showWorkoutTemplateNote),
        className: workoutTemplateNote === null ? "hidden" : "",
      },
      "load-workout-template": {
        text: "Load Workout Template",
        function: () => handleOpenWorkoutTemplateListModal(),
      },
      "copy-workout": {
        text: "Copy Previous Workout",
        function: () => handleOpenWorkoutListModal(),
      },
    };
  }, [
    workoutTemplateNote,
    showWorkoutTemplateNote,
    handleOpenWorkoutListModal,
    handleOpenWorkoutTemplateListModal,
  ]);

  const useDetailsHeaderOptions = useDetailsHeaderOptionsMenu(
    "Workout",
    additionalMenuItems
  );

  const userWeightInputs = useUserWeightInput(
    userWeight,
    setUserWeight,
    userWeightModal,
    userSettings
  );

  const handleUserWeightModalAddButton = async () => {
    const { success, weight, weight_unit } =
      await userWeightInputs.addUserWeight();

    if (!success) return;

    populateUserWeightValues(weight, weight_unit);
    setIsUserWeightOlderThanOneWeek(false);
  };

  const getWorkoutTemplateNote = useCallback(
    async (workoutTemplateId: number) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplateNote[]>(
          "SELECT note FROM workout_templates WHERE id = $1",
          [workoutTemplateId]
        );

        const note = result[0].note;

        if (!note) return;

        if (workoutTemplateNote === null) {
          setWorkoutTemplateNote(note);
        } else {
          // If a Workout Template note already exists, extend existing note
          const newNote = workoutTemplateNote.concat(", ", note);

          setWorkoutTemplateNote(newNote);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [workoutTemplateNote]
  );

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Workout[]>(
          "SELECT * FROM workouts WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const workout: Workout = result[0];

        const setList = await GetWorkoutSetList(workout.id);

        const { groupedSetList, shouldUpdateExerciseOrder } =
          await CreateGroupedWorkoutSetList(
            setList,
            workout.exercise_order,
            exerciseList.exerciseGroupDictionary
          );

        if (shouldUpdateExerciseOrder) {
          const { success, exerciseOrderString } = await UpdateExerciseOrder(
            groupedSetList,
            Number(id),
            false
          );

          if (!success) return;

          workout.exercise_order = exerciseOrderString;
        }

        const workoutNumbers = {
          numSets: setList.length,
          numExercises: GetNumberOfUniqueExercisesInGroupedSets(groupedSetList),
        };
        setWorkoutNumbers(workoutNumbers);

        setWorkoutNote(workout.note === null ? "" : workout.note);
        setGroupedSets(groupedSetList);

        populateIncompleteSets(groupedSetList);

        workout.formattedDate = FormatDateString(workout.date);

        if (workout.workout_template_id !== 0) {
          await getWorkoutTemplateNote(workout.workout_template_id);
        }

        setWorkout(workout);
      } catch (error) {
        console.log(error);
      }
    };

    loadWorkout();
    // Including useWorkoutActions-derived functions and setStates will cause useEffect to fire after initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, exerciseList.exerciseGroupDictionary]);

  const handleWorkoutModalSaveButton = async (updatedWorkout: Workout) => {
    if (updatedWorkout.id === 0) return;

    const success = await UpdateWorkout(updatedWorkout);

    if (!success) return;

    setWorkout(updatedWorkout);

    toast.success("Workout Details Updated");
    workoutModal.onClose();
  };

  const handleClickWorkoutTemplate = async (
    workoutTemplate: WorkoutTemplate
  ) => {
    const templateGroupedSetList = await CreateSetsFromWorkoutTemplate(
      workout.id,
      workoutTemplate.id,
      exerciseList.exerciseGroupDictionary
    );

    const updatedGroupedSetList = MergeTwoGroupedSetLists(
      groupedSets,
      templateGroupedSetList
    );

    const exerciseOrder = GenerateExerciseOrderString(updatedGroupedSetList);

    const updatedWorkout: Workout = {
      ...workout,
      workout_template_id: workoutTemplate.id,
      exercise_order: exerciseOrder,
    };

    const success = await UpdateWorkout(updatedWorkout);

    if (!success) return;

    setWorkout(updatedWorkout);

    const workoutNumbers = {
      numSets: GetTotalNumberOfSetsInGroupedSetList(updatedGroupedSetList),
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(
        updatedGroupedSetList
      ),
    };
    setWorkoutNumbers(workoutNumbers);

    setGroupedSets(updatedGroupedSetList);

    populateIncompleteSets(updatedGroupedSetList);

    await getWorkoutTemplateNote(workoutTemplate.id);

    toast.success("Workout Template Loaded");
    workoutTemplateListModal.onClose();
  };

  const handleClickWorkout = async (
    workoutToCopy: Workout,
    keepSetValues: boolean
  ) => {
    if (workout.id === 0 || userSettings === undefined) return;

    let oldWorkoutExerciseOrder = await GetExerciseOrder(
      workoutToCopy.id,
      false
    );

    if (oldWorkoutExerciseOrder === undefined) return;

    const oldWorkoutSetList = await GetWorkoutSetList(workoutToCopy.id);

    const { newSetList, workoutExerciseOrder } = await CopyWorkoutSetList(
      oldWorkoutSetList,
      workout.id,
      keepSetValues,
      userSettings,
      oldWorkoutExerciseOrder
    );

    oldWorkoutExerciseOrder = workoutExerciseOrder;

    // Old workout GroupedSetList
    const { groupedSetList } = await CreateGroupedWorkoutSetList(
      newSetList,
      oldWorkoutExerciseOrder,
      exerciseList.exerciseGroupDictionary
    );

    const updatedGroupedSetList = MergeTwoGroupedSetLists(
      groupedSets,
      groupedSetList
    );

    const exerciseOrder: string = GenerateExerciseOrderString(
      updatedGroupedSetList
    );

    const updatedWorkout = { ...workout, exercise_order: exerciseOrder };

    const success = await UpdateWorkout(updatedWorkout);

    if (!success) return;

    setWorkout(updatedWorkout);

    const workoutNumbers = {
      numSets: GetTotalNumberOfSetsInGroupedSetList(updatedGroupedSetList),
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(
        updatedGroupedSetList
      ),
    };
    setWorkoutNumbers(workoutNumbers);

    setGroupedSets(updatedGroupedSetList);

    populateIncompleteSets(updatedGroupedSetList);

    toast.success("Workout Copied");
    workoutListModal.onClose();
  };

  if (workout.id === 0 || userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <WorkoutModal
        workoutModal={workoutModal}
        workout={workout}
        setWorkout={setWorkout}
        workoutNote={workoutNote}
        setWorkoutNote={setWorkoutNote}
        workoutTemplateNote={workoutTemplateNote}
        workoutRatingsOrder={userSettings.workout_ratings_order}
        buttonAction={handleWorkoutModalSaveButton}
      />
      <WorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        onClickAction={handleClickWorkoutTemplate}
        header={<span>Load Workout Template</span>}
      />
      <WorkoutListModal
        workoutList={workoutList}
        shownWorkoutProperties={userSettings.shown_workout_properties}
        onClickAction={handleClickWorkout}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header={`Delete Set${
          operationType === "delete-grouped_sets-sets" ? "s" : ""
        }`}
        body={
          <p className="break-words">
            Are you sure you want to delete{" "}
            {operationType === "delete-grouped_sets-sets" ? (
              operatingGroupedSet?.isMultiset ? (
                <>
                  <span className="text-secondary">
                    {multisetActions.multisetTypeMap.get(
                      operatingGroupedSet.multiset!.multiset_type
                    )}
                  </span>{" "}
                  from Workout
                </>
              ) : (
                <>
                  all{" "}
                  <span className="text-secondary">
                    {operatingGroupedSet?.exerciseList[0].name}
                  </span>{" "}
                  sets from Workout
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
      <TimeInputModal
        timeInputModal={timeInputModal}
        header="Update Time Completed"
        clockStyle={userSettings.clock_style}
        locale={userSettings.locale}
        value={operatingSet.time_completed}
        saveButtonAction={updateSetTimeCompleted}
      />
      <TextInputModal
        textInputModal={textInputModal}
        value={setCommentInput}
        setValue={setSetCommentInput}
        label="Comment"
        header="Set Comment"
        buttonAction={handleTextInputModalButton}
      />
      <UserWeightModal
        userWeightModal={userWeightModal}
        userWeightInput={userWeightInputs.userWeightInput}
        setUserWeightInput={userWeightInputs.setUserWeightInput}
        isWeightInputValid={userWeightInputs.isWeightInputValid}
        weightUnit={userWeightInputs.weightUnit}
        setWeightUnit={userWeightInputs.setWeightUnit}
        commentInput={userWeightInputs.weightCommentInput}
        setCommentInput={userWeightInputs.setWeightCommentInput}
        buttonAction={handleUserWeightModalAddButton}
        isEditing={false}
      />
      <GroupedWorkoutSetListModal
        groupedWorkoutSetListModal={groupedWorkoutSetListModal}
        operatingGroupedSet={operatingGroupedSet}
        groupedWorkoutSetList={groupedSets}
        multisetTypeMap={multisetActions.multisetTypeMap}
        onClickAction={mergeGroupedSets}
      />
      <FilterWorkoutListModal
        useWorkoutList={workoutList}
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
      />
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <FilterWorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
        userSettings={userSettings}
      />
      <FilterRoutineListModal
        useRoutineList={routineList}
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
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
          header={workout.formattedDate ?? workout.date}
          subHeader={`${FormatNumItemsString(
            workoutNumbers.numExercises,
            "Exercise"
          )}, ${FormatNumItemsString(workoutNumbers.numSets, "Set")}`}
          note={workout.note}
          detailsType="Workout"
          editButtonAction={() => workoutModal.onOpen()}
          useDetailsHeaderOptions={useDetailsHeaderOptions}
          extraContent={
            showWorkoutTemplateNote && (
              <div className="flex justify-center w-full">
                <span className="break-all font-medium text-stone-500">
                  {workoutTemplateNote}
                </span>
              </div>
            )
          }
        />
        <div className="pt-2 pb-[4.5rem]">
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
            isTemplate={false}
            activeSetId={activeSet?.id}
            completedSetsMap={completedSetsMap}
            multisetTypeMap={multisetActions.multisetTypeMap}
            handleToggleSetCommentButton={handleToggleSetCommentButton}
          />
        </div>
        <ActiveSet
          activeSet={activeSet}
          setActiveSet={setActiveSet}
          isActiveSetExpanded={isActiveSetExpanded}
          setIsActiveSetExpanded={setIsActiveSetExpanded}
          userSettings={userSettings!}
          activeGroupedSet={activeGroupedSet}
          handleReassignExercise={handleReassignExercise}
          handleActiveSetOptionSelection={handleActiveSetOptionSelection}
          activeSetNote={activeSetNote}
          setActiveSetNote={setActiveSetNote}
          handleClickSet={handleClickSet}
          handleSetOptionSelection={handleSetOptionSelection}
          updateShownSetListComments={updateShownSetListComments}
          shownSetListComments={shownSetListComments}
          activeSetInputs={activeSetInputs}
          handleEditSet={handleEditSet}
          resetSetInputValues={resetSetInputValues}
          saveActiveSet={saveActiveSet}
          handleToggleSetCommentButton={handleToggleSetCommentButton}
          userWeight={userWeight}
          userWeightModal={userWeightModal}
          populateUserWeightValues={populateUserWeightValues}
          isUserWeightOlderThanOneWeek={isUserWeightOlderThanOneWeek}
          clearActiveSetInputValues={clearActiveSetInputValues}
          openCalculationModal={openCalculationModal}
        />
      </div>
    </>
  );
}
