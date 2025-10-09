import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Workout,
  DetailHeaderOptionItem,
  WorkoutTemplate,
  WorkoutSet,
} from "../typings";
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
  SetNotesModal,
  OldSetWarningModal,
} from "../components";
import Database from "@tauri-apps/plugin-sql";
import {
  CreateSetsFromWorkoutTemplate,
  CreateGroupedWorkoutSetList,
  GenerateExerciseOrderString,
  UpdateWorkout,
  GetNumberOfUniqueExercisesInGroupedSets,
  GetTotalNumberOfSetsInGroupedSetList,
  GetWorkoutSetList,
  GetExerciseOrder,
  MergeTwoGroupedSetLists,
  CopyWorkoutSetList,
  FormatDateString,
  UpdateExerciseOrder,
  IsDateStringOlderThan24Hours,
  GetLatestTimeForDayISODateString,
} from "../helpers";
import { useDisclosure } from "@heroui/react";
import toast from "react-hot-toast";
import {
  useDetailsHeaderOptionsMenu,
  useNumExercisesAndSetsString,
  useWorkoutActions,
  useWorkoutList,
} from "../hooks";

type WorkoutTemplateNote = {
  note: string | null;
};

export default function WorkoutDetails() {
  const { id } = useParams();

  const workoutModal = useDisclosure();
  const oldSetWarningModal = useDisclosure();

  const [workoutTemplateNote, setWorkoutTemplateNote] = useState<string | null>(
    null
  );
  const [showWorkoutTemplateNote, setShowWorkoutTemplateNote] =
    useState<boolean>(false);
  const [isWorkoutOlderThan24Hours, setIsWorkoutOlderThan24Hours] =
    useState<boolean>(false);
  const [oldSetToSave, setOldSetToSave] = useState<WorkoutSet>();
  const [saveOldSetOnToday, setSaveOldSetOnToday] = useState<boolean>(false);
  const [doNotShowOldSetWarningModal, setDoNotShowOldSetWarningModal] =
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
    shownSetListComments,
    setIsExerciseBeingDragged,
    workout,
    setWorkout,
    activeSet,
    setActiveSet,
    saveActiveSet,
    populateIncompleteSets,
    isActiveSetExpanded,
    setIsActiveSetExpanded,
    activeGroupedSet,
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
    handleSetNotesModalButton,
    openSetNotesModal,
    numMultisetSets,
    presetsList,
    calculationModal,
    addCalculationResult,
    openCalculationModal,
    groupedWorkoutSetListModal,
    mergeGroupedSets,
    populateUserWeightValues,
    showGetUserWeightButton,
    showOldUserWeightLabel,
    setShowOldUserWeightLabel,
    userWeight,
    setNotesModal,
    store,
  } = useWorkoutActions({ isTemplate: false });

  const workoutList = useWorkoutList({
    store: store,
    useExerciseList: exerciseList,
    ignoreEmptyWorkouts: true,
    workoutIdToIgnore: Number(id),
  });

  const {
    workoutTemplateList,
    routineList,
    handleOpenWorkoutListModal,
    workoutListModal,
  } = workoutList;

  const { handleOpenWorkoutTemplateListModal, workoutTemplateListModal } =
    workoutTemplateList;

  const workoutDetailsSubHeader = useNumExercisesAndSetsString(
    workoutNumbers.numExercises,
    workoutNumbers.numSets
  );

  const additionalMenuItems: DetailHeaderOptionItem = useMemo(() => {
    return {
      "toggle-workout-template-note": {
        text: "Toggle Workout Template Note",
        function: () => setShowWorkoutTemplateNote(!showWorkoutTemplateNote),
        className: workoutTemplateNote === null ? "hidden" : "",
      },
      "load-workout-template": {
        text: "Load Workout Template",
        function: () => handleOpenWorkoutTemplateListModal(userSettings),
      },
      "copy-workout": {
        text: "Copy Previous Workout",
        function: () => handleOpenWorkoutListModal(userSettings),
      },
    };
  }, [
    workoutTemplateNote,
    showWorkoutTemplateNote,
    handleOpenWorkoutListModal,
    handleOpenWorkoutTemplateListModal,
    userSettings,
  ]);

  const useDetailsHeaderOptions = useDetailsHeaderOptionsMenu({
    detailsType: "Workout",
    additionalMenuItems: additionalMenuItems,
    isNoteComment: true,
  });

  const getWorkoutTemplateNote = async (workoutTemplateId: number) => {
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
  };

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Workout[]>(
          `SELECT * FROM workouts 
             WHERE id = $1 
              AND date IS NOT NULL 
              AND date LIKE '____-__-__T__:__:__.___Z'
              AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'`,
          [id]
        );

        if (result.length === 0) return;

        const workout = result[0];

        if (IsDateStringOlderThan24Hours(workout.date)) {
          setIsWorkoutOlderThan24Hours(true);
        }

        const setList = await GetWorkoutSetList(workout.id);

        const { groupedSetList, shouldUpdateExerciseOrder } =
          await CreateGroupedWorkoutSetList(
            setList,
            workout.exercise_order,
            exerciseList.exerciseGroupDictionary
          );

        if (shouldUpdateExerciseOrder) {
          const isTemplate = false;

          const { success, exerciseOrderString } = await UpdateExerciseOrder(
            groupedSetList,
            Number(id),
            isTemplate
          );

          if (!success) return;

          workout.exercise_order = exerciseOrderString;
        }

        const workoutNumbers = {
          numSets: setList.length,
          numExercises: GetNumberOfUniqueExercisesInGroupedSets(groupedSetList),
        };
        setWorkoutNumbers(workoutNumbers);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (workout.id === 0) return;

    const isTemplate = false;

    let oldWorkoutExerciseOrder = await GetExerciseOrder(
      workoutToCopy.id,
      isTemplate
    );

    if (oldWorkoutExerciseOrder === undefined) return;

    const oldWorkoutSetList = await GetWorkoutSetList(workoutToCopy.id);

    const { newSetList, workoutExerciseOrder } = await CopyWorkoutSetList(
      oldWorkoutSetList,
      workout.id,
      keepSetValues,
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

  const openOldSetWarningModal = (set: WorkoutSet) => {
    if (doNotShowOldSetWarningModal) {
      if (saveOldSetOnToday) {
        saveActiveSet(set);
      } else {
        const dateOfWorkout = GetLatestTimeForDayISODateString(workout.date);

        if (dateOfWorkout === "Invalid Date") return;

        saveActiveSet(set, dateOfWorkout);
      }
    } else {
      setOldSetToSave(set);
      oldSetWarningModal.onOpen();
    }
  };

  const saveOldSet = (saveOnToday: boolean) => {
    if (oldSetToSave === undefined) return;

    if (saveOnToday) {
      saveActiveSet(oldSetToSave);
    } else {
      const dateOfWorkout = GetLatestTimeForDayISODateString(workout.date);

      if (dateOfWorkout === "Invalid Date") return;

      saveActiveSet(oldSetToSave, dateOfWorkout);
    }

    setOldSetToSave(undefined);
    oldSetWarningModal.onClose();
  };

  if (workout.id === 0 || userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <WorkoutModal
        workoutModal={workoutModal}
        workout={workout}
        workoutTemplateNote={workoutTemplateNote}
        buttonAction={handleWorkoutModalSaveButton}
        resetInputsAfterSaving
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
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header={`Delete Set${
          operationType === "delete-grouped_sets-sets" ? "s" : ""
        }`}
        body={
          <p>
            Are you sure you want to delete{" "}
            {operationType === "delete-grouped_sets-sets" ? (
              operatingGroupedSet?.isMultiset ? (
                <>
                  <span className="text-secondary">
                    {operatingGroupedSet.multiset!.multiset_type}
                  </span>{" "}
                  from Workout
                </>
              ) : (
                <>
                  all{" "}
                  <span className="text-secondary truncate max-w-[24rem] inline-block align-top">
                    {operatingGroupedSet?.exerciseList[0].name}
                  </span>{" "}
                  sets from Workout
                </>
              )
            ) : (
              <>
                <span className="text-secondary truncate max-w-[22rem] inline-block align-top">
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
        handleSaveSetButton={handleSaveSetButton}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        exerciseList={exerciseList}
        numMultisetSets={numMultisetSets}
        openCalculationModal={openCalculationModal}
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
        setUserSettings={setUserSettings}
        saveButtonAction={handleSaveMultisetButton}
        handleClickMultiset={handleClickMultiset}
        showWorkoutItems={true}
        openCalculationModal={openCalculationModal}
      />
      <TimeInputModal
        timeInputModal={timeInputModal}
        header="Update Time Completed"
        clockStyle={userSettings.clock_style}
        locale={userSettings.locale}
        value={operatingSet.time_completed}
        saveButtonAction={updateSetTimeCompleted}
      />
      <SetNotesModal
        setNotesModal={setNotesModal}
        operatingSet={operatingSet}
        operatingGroupedWorkoutSet={operatingGroupedSet}
        isTemplate={false}
        handleSaveButton={handleSetNotesModalButton}
      />
      <GroupedWorkoutSetListModal
        groupedWorkoutSetListModal={groupedWorkoutSetListModal}
        operatingGroupedSet={operatingGroupedSet}
        groupedWorkoutSetList={groupedSets}
        onClickAction={mergeGroupedSets}
      />
      <FilterWorkoutListModal
        useWorkoutList={workoutList}
        useExerciseList={exerciseList}
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterExerciseGroupsModal useExerciseList={exerciseList} />
      <FilterWorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        useExerciseList={exerciseList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
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
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <OldSetWarningModal
        oldSetWarningModal={oldSetWarningModal}
        workout={workout}
        setSaveOldSetOnToday={setSaveOldSetOnToday}
        doNotShowOldSetWarningModal={doNotShowOldSetWarningModal}
        setDoNotShowOldSetWarningModal={setDoNotShowOldSetWarningModal}
        doneButtonAction={saveOldSet}
      />
      {userSettings.show_calculation_buttons === 1 && (
        <CalculationModal
          useCalculationModal={calculationModal}
          usePresetsList={presetsList}
          doneButtonAction={addCalculationResult}
          userSettings={userSettings}
          setUserSettings={setUserSettings}
        />
      )}
      <div className="flex flex-col">
        <DetailsHeader
          header={workout.formattedDate ?? workout.date}
          subHeader={workoutDetailsSubHeader}
          note={workout.comment}
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
          isNoteComment
        />
        {!isActiveSetExpanded && (
          <div
            className={
              activeSet !== undefined ? "pt-2 pb-[5.5rem]" : "pt-2 pb-2"
            }
          >
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
              openSetNotesModal={openSetNotesModal}
            />
          </div>
        )}
        <ActiveSet
          activeSet={activeSet}
          setActiveSet={setActiveSet}
          isActiveSetExpanded={isActiveSetExpanded}
          setIsActiveSetExpanded={setIsActiveSetExpanded}
          userSettings={userSettings!}
          activeGroupedSet={activeGroupedSet}
          handleReassignExercise={handleReassignExercise}
          handleClickSet={handleClickSet}
          handleSetOptionSelection={handleSetOptionSelection}
          updateShownSetListComments={updateShownSetListComments}
          shownSetListComments={shownSetListComments}
          handleEditSet={handleEditSet}
          saveActiveSet={saveActiveSet}
          openSetNotesModal={openSetNotesModal}
          populateUserWeightValues={populateUserWeightValues}
          openCalculationModal={openCalculationModal}
          showGetUserWeightButton={showGetUserWeightButton}
          showOldUserWeightLabel={showOldUserWeightLabel}
          setShowOldUserWeightLabel={setShowOldUserWeightLabel}
          userWeight={userWeight}
          isWorkoutOlderThan24Hours={isWorkoutOlderThan24Hours}
          openOldSetWarningModal={openOldSetWarningModal}
        />
      </div>
    </>
  );
}
