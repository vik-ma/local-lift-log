import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Workout,
  WorkoutSet,
  GroupedWorkoutSet,
  DetailHeaderOptionItem,
  WorkoutTemplateListItem,
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
  TextInputModal,
  UserWeightModal,
  WorkoutTemplateListModal,
} from "../components";
import Database from "tauri-plugin-sql-api";
import {
  CreateSetsFromWorkoutTemplate,
  CreateGroupedWorkoutSetList,
  GenerateExerciseOrderString,
  FormatYmdDateString,
  UpdateWorkout,
  GetNumberOfUniqueExercisesInGroupedSets,
  FormatNumItemsString,
  GetTotalNumberOfSetsInGroupedSetList,
  GetWorkoutTemplates,
} from "../helpers";
import { useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  useDetailsHeaderOptionsMenu,
  useUserWeightInput,
  useWorkoutActions,
} from "../hooks";

type WorkoutTemplateNote = {
  note: string | null;
};

export default function WorkoutDetails() {
  const { id } = useParams();

  const workoutModal = useDisclosure();
  const userWeightModal = useDisclosure();

  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [workoutNote, setWorkoutNote] = useState<string>("");
  const [workoutTemplateNote, setWorkoutTemplateNote] = useState<string | null>(
    null
  );
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);

  const workoutTemplatesModal = useDisclosure();

  const handleOpenWorkoutTemplatesModal = useCallback(async () => {
    if (workoutTemplates.length === 0) {
      const workoutTemplates = await GetWorkoutTemplates();
      setWorkoutTemplates(workoutTemplates);
    }

    workoutTemplatesModal.onOpen();
  }, [workoutTemplates, workoutTemplatesModal]);

  // TODO: ADD FUNCTIONS
  const additionalMenuItems: DetailHeaderOptionItem = useMemo(() => {
    return {
      "load-workout-template": {
        text: "Load Workout Template",
        function: () => handleOpenWorkoutTemplatesModal(),
      },
      "copy-workout": {
        text: "Copy Previous Workout",
        function: () => {},
      },
    };
  }, [handleOpenWorkoutTemplatesModal]);

  const useDetailsHeaderOptions =
    useDetailsHeaderOptionsMenu(additionalMenuItems);

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
    multisetModal,
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
  } = useWorkoutActions(false);

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

  const initialized = useRef(false);

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

        if (workout.is_loaded === 1) {
          const setList = await db.select<WorkoutSet[]>(
            `SELECT sets.*, 
            COALESCE(exercises.name, 'Unknown Exercise') AS exercise_name
            FROM sets LEFT JOIN 
            exercises ON sets.exercise_id = exercises.id 
            WHERE workout_id = $1 AND is_template = 0`,
            [id]
          );

          const groupedSetList: GroupedWorkoutSet[] =
            await CreateGroupedWorkoutSetList(setList, workout.exercise_order);

          const workoutNumbers = {
            numSets: setList.length,
            numExercises:
              GetNumberOfUniqueExercisesInGroupedSets(groupedSetList),
          };
          setWorkoutNumbers(workoutNumbers);

          setWorkoutNote(workout.note === null ? "" : workout.note);
          setGroupedSets(groupedSetList);

          populateIncompleteSets(groupedSetList);
        } else {
          // Stop useEffect running twice in dev
          if (!initialized.current) {
            initialized.current = true;
          } else return;

          if (workout.workout_template_id !== 0) {
            const groupedSetList = await CreateSetsFromWorkoutTemplate(
              workout.id,
              workout.workout_template_id
            );

            const exerciseOrder: string =
              GenerateExerciseOrderString(groupedSetList);
            workout.exercise_order = exerciseOrder;

            const workoutNumbers = {
              numSets: GetTotalNumberOfSetsInGroupedSetList(groupedSetList),
              numExercises:
                GetNumberOfUniqueExercisesInGroupedSets(groupedSetList),
            };
            setWorkoutNumbers(workoutNumbers);

            setGroupedSets(groupedSetList);

            populateIncompleteSets(groupedSetList);
          }

          workout.is_loaded = 1;

          const success = await UpdateWorkout(workout);

          if (!success) return;
        }

        const formattedDate: string = FormatYmdDateString(workout.date);

        if (workout.workout_template_id !== 0) {
          await getWorkoutTemplateNote(workout.workout_template_id);
        }

        setWorkout(workout);
        setWorkoutDate(formattedDate);
      } catch (error) {
        console.log(error);
      }
    };

    const getWorkoutTemplateNote = async (workoutTemplateId: number) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplateNote[]>(
          "SELECT note FROM workout_templates WHERE id = $1",
          [workoutTemplateId]
        );

        const note = result[0].note;

        if (note) setWorkoutTemplateNote(note);
      } catch (error) {
        console.log(error);
      }
    };

    loadWorkout();
    // Including useWorkoutActions-derived functions and setStates will cause useEffect to fire after initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleWorkoutModalSaveButton = async (updatedWorkout: Workout) => {
    if (updatedWorkout.id === 0) return;

    const success = await UpdateWorkout(updatedWorkout);

    if (!success) return;

    setWorkout(updatedWorkout);

    toast.success("Workout Details Updated");
    workoutModal.onClose();
  };

  const handleSelectWorkoutTemplate = async (workoutTemplateId: number) => {
    const templateGroupedSetList = await CreateSetsFromWorkoutTemplate(
      workout.id,
      workoutTemplateId
    );

    const updatedGroupedSetList = [...groupedSets];

    const groupedSetMap = new Map<string, GroupedWorkoutSet>();

    updatedGroupedSetList.forEach((item) => {
      groupedSetMap.set(item.id, item);
    });

    templateGroupedSetList.forEach((item) => {
      if (groupedSetMap.has(item.id)) {
        // If a groupedSet with the same id exists, append the exerciseList and setList to that groupedSet
        const existingGroupedSet = groupedSetMap.get(item.id)!;
        existingGroupedSet.exerciseList.push(...item.exerciseList);
        existingGroupedSet.setList.push(...item.setList);
      } else {
        // If a groupedSet with the same id doesn't exist, add the groupedSet to existing list
        updatedGroupedSetList.push(item);
      }
    });

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

    toast.success("Workout Template Loaded");
    workoutTemplatesModal.onClose();
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
        buttonAction={handleWorkoutModalSaveButton}
      />
      <WorkoutTemplateListModal
        workoutTemplateListModal={workoutTemplatesModal}
        workoutTemplates={workoutTemplates}
        listboxOnActionFunction={handleSelectWorkoutTemplate}
        header={<span>Load Workout Template</span>}
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
                    {
                      multisetActions.multisetTypeMap[
                        operatingGroupedSet.multiset!.multiset_type
                      ].text
                    }
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
      <div className="flex flex-col">
        <DetailsHeader
          header={workoutDate}
          subHeader={`${FormatNumItemsString(
            workoutNumbers.numExercises,
            "Exercise"
          )}, ${FormatNumItemsString(workoutNumbers.numSets, "Set")}`}
          note={workout.note}
          detailsType="Workout"
          editButtonAction={() => workoutModal.onOpen()}
          useDetailsHeaderOptions={useDetailsHeaderOptions}
        />
        <div className="mb-[4.5rem]">
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
          clearSetInputValues={clearSetInputValues}
          saveActiveSet={saveActiveSet}
          handleToggleSetCommentButton={handleToggleSetCommentButton}
          userWeight={userWeight}
          userWeightModal={userWeightModal}
          populateUserWeightValues={populateUserWeightValues}
          isUserWeightOlderThanOneWeek={isUserWeightOlderThanOneWeek}
        />
      </div>
    </>
  );
}
