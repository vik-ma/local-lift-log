import { useState, useEffect } from "react";
import {
  Multiset,
  Exercise,
  WorkoutSet,
  UserSettings,
  PresetsType,
  CalculationListItem,
} from "../typings";
import {
  useCalculationModal,
  useDefaultMultiset,
  useDefaultSet,
  useExerciseList,
  useMultisetActions,
  usePresetsList,
  useSetTrackingInputs,
} from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import {
  AssignTrackingValuesIfCardio,
  ConvertEmptyStringToNull,
  DeleteMultisetWithId,
  DeleteSetWithId,
  GetUserSettings,
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  UpdateMultisetSetOrder,
  UpdateSet,
  DeleteItemFromList,
  UpdateItemInList,
} from "../helpers";
import {
  CalculationModal,
  DeleteModal,
  ListPageSearchInput,
  LoadingSpinner,
  MultisetAccordion,
  MultisetModal,
} from "../components";
import toast, { Toaster } from "react-hot-toast";

export type OperationType = "add" | "edit" | "delete";

export default function Multisets() {
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const defaultMultiset = useDefaultMultiset();

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const multisetModal = useDisclosure();
  const deleteModal = useDisclosure();

  const defaultSet: WorkoutSet = {
    ...useDefaultSet(true),
    is_tracking_weight: 1,
    is_tracking_reps: 1,
  };

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultSet);

  const operatingSetInputs = useSetTrackingInputs();

  const exerciseList = useExerciseList();

  const multisetActions = useMultisetActions({
    operatingMultiset,
    setOperatingMultiset,
    operatingSet,
    setOperatingSet,
    deleteModal,
    multisetModal,
    exerciseList,
    defaultMultiset,
    operatingSetInputs,
    setOperationType,
  });

  const calculationModal = useCalculationModal();

  const presetsList = usePresetsList(false, false);

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();
      if (userSettings !== undefined) {
        setUserSettings(userSettings);
        setOperatingSet((prev) => ({
          ...prev,
          weight_unit: userSettings.default_unit_weight,
          distance_unit: userSettings.default_unit_distance,
          user_weight_unit: userSettings.default_unit_weight,
        }));
      }
    };

    loadUserSettings();
  }, []);

  const handleCreateNewMultisetButton = () => {
    if (operationType !== "add") {
      resetOperatingMultiset();
    }
    multisetModal.onOpen();
  };

  const resetOperatingMultiset = () => {
    setOperationType("add");
    setOperatingMultiset(defaultMultiset);
    setOperatingSet({
      ...defaultSet,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
      user_weight_unit: userSettings!.default_unit_weight,
    });
    multisetActions.clearMultiset("base");
  };

  const handleClickExercise = async (exercise: Exercise) => {
    if (multisetActions.multisetSetOperationType === "change-exercise") {
      if (multisetActions.calledOutsideModal) {
        // Change exercise and save directly to DB
        const { success, updatedMultisets } =
          await multisetActions.changeExerciseAndSave(exercise);

        if (!success || updatedMultisets === undefined) return;

        multisetActions.setMultisets(updatedMultisets);

        resetOperatingMultiset();

        toast.success("Exercise Changed");
      } else {
        // Change exercise in operatingMultiset, but don't save to DB
        multisetActions.updateExerciseInOperatingSet(exercise);
      }
      return;
    }

    if (multisetActions.multisetSetOperationType === "reassign-exercise") {
      const success = await multisetActions.reassignExercise(exercise);

      if (!success) return;

      resetOperatingMultiset();
      toast.success("Exercise Reassigned");
      return;
    }

    addSet(exercise);
  };

  const addSet = (exercise: Exercise) => {
    const setId = multisetActions.newMultisetSetIndex - 1;

    let newSet: WorkoutSet = {
      ...operatingSet,
      id: setId,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
    };

    newSet = AssignTrackingValuesIfCardio(
      newSet,
      exercise.formattedGroupString ?? ""
    );

    const newSetList = [...operatingMultiset.setList, newSet];

    setOperatingMultiset((prev) => ({
      ...prev,
      setList: newSetList,
      isEditedInModal: true,
    }));

    multisetActions.setModalPage("base");

    multisetActions.setNewMultisetSetIndex((prev) => prev - 1);
  };

  const createMultiset = async () => {
    if (operationType !== "add") return;

    const noteToInsert = ConvertEmptyStringToNull(operatingMultiset.note);

    operatingMultiset.note = noteToInsert;

    const multisetId = await InsertMultisetIntoDatabase(operatingMultiset);

    if (multisetId === 0) return;

    operatingMultiset.id = multisetId;

    const setListIdOrder: number[] = [];

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      operatingMultiset.setList[i].multiset_id = multisetId;

      const setId = await InsertSetIntoDatabase(operatingMultiset.setList[i]);

      if (setId === 0) return;

      operatingMultiset.setList[i].id = setId;

      setListIdOrder.push(setId);
    }

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      operatingMultiset,
      [setListIdOrder]
    );

    if (!success) return;

    updatedMultiset.isEditedInModal = false;

    multisetActions.setMultisets([
      ...multisetActions.multisets,
      updatedMultiset,
    ]);

    resetOperatingMultiset();
    multisetModal.onClose();
    toast.success("Multiset Created");
  };

  const updateMultiset = async () => {
    if (!operatingMultiset.isEditedInModal) {
      resetOperatingMultiset();
      multisetModal.onClose();
      return;
    }

    if (operationType !== "edit" || operatingMultiset.id === 0) return;

    const noteToInsert = ConvertEmptyStringToNull(operatingMultiset.note);

    operatingMultiset.note = noteToInsert;

    const setListIdOrder: number[] = [];

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      if (operatingMultiset.setList[i].id < 0) {
        // Add new Set to Multiset
        operatingMultiset.setList[i].multiset_id = operatingMultiset.id;

        const newSetId = await InsertSetIntoDatabase(
          operatingMultiset.setList[i]
        );

        if (newSetId === 0) return;

        operatingMultiset.setList[i].id = newSetId;
      }

      if (operatingMultiset.setList[i].isEditedInMultiset) {
        const success = await UpdateSet(operatingMultiset.setList[i]);

        if (!success) continue;

        operatingMultiset.setList[i].isEditedInMultiset = false;
      }

      setListIdOrder.push(operatingMultiset.setList[i].id);
    }

    for (const setId of multisetActions.setsToDelete) {
      await DeleteSetWithId(setId);
    }

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      operatingMultiset,
      [setListIdOrder]
    );

    updatedMultiset.isEditedInModal = false;

    if (!success) return;

    const updatedMultisets = UpdateItemInList(
      multisetActions.multisets,
      updatedMultiset
    );

    multisetActions.setMultisets(updatedMultisets);

    resetOperatingMultiset();
    multisetModal.onClose();
    toast.success("Multiset Updated");
  };

  const deleteMultiset = async () => {
    if (operatingMultiset.id === 0 || operationType !== "delete") return;

    const success = await DeleteMultisetWithId(operatingMultiset.id);

    if (!success) return;

    const updatedMultisets = DeleteItemFromList(
      multisetActions.multisets,
      operatingMultiset.id
    );

    multisetActions.setMultisets(updatedMultisets);

    resetOperatingMultiset();
    toast.success("Multiset Deleted");
    deleteModal.onClose();
  };

  const handleMultisetAccordionClick = (multiset: Multiset, index: number) => {
    const updatedMultiset: Multiset = {
      ...multiset,
      isExpanded: !multiset.isExpanded,
    };

    const updatedMultisets = [...multisetActions.multisets];
    updatedMultisets[index] = updatedMultiset;

    multisetActions.setMultisets(updatedMultisets);
  };

  const removeSetFromMultiset = async () => {
    if (operatingSet.id === 0) return;

    const deleteSetSuccess = await DeleteSetWithId(operatingSet.id);

    if (!deleteSetSuccess) return;

    const updatedSetList = DeleteItemFromList(
      operatingMultiset.setList,
      operatingSet.id
    );

    operatingMultiset.setList = updatedSetList;

    const setListIdOrder = updatedSetList.map((obj) => obj.id);

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      operatingMultiset,
      [setListIdOrder]
    );

    if (!success) return;

    let toastMsg = "Set Removed";

    let updatedMultisets: Multiset[] = [];

    if (updatedMultiset.setList.length === 0) {
      // Delete Multiset if last set was deleted
      const deleteMultisetSuccess = await DeleteMultisetWithId(
        operatingMultiset.id
      );

      if (!deleteMultisetSuccess) return;

      updatedMultisets = DeleteItemFromList(
        multisetActions.multisets,
        operatingMultiset.id
      );

      toastMsg = "Multiset Deleted";

      if (multisetModal.isOpen) {
        multisetModal.onClose();
      }
    } else {
      updatedMultisets = UpdateItemInList(
        multisetActions.multisets,
        updatedMultiset
      );
    }

    multisetActions.setMultisets(updatedMultisets);

    if (!multisetModal.isOpen) {
      resetOperatingMultiset();
    }

    deleteModal.onClose();
    toast.success(toastMsg);
  };

  const handleMultisetOptionSelection = (key: string, multiset: Multiset) => {
    if (key === "edit") {
      setOperationType("edit");
      multisetActions.clearMultiset("base", { ...multiset });
      multisetActions.setUneditedMultiset({ ...multiset });
      multisetModal.onOpen();
    } else if (key === "delete") {
      setOperatingMultiset(multiset);
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const addCalculationResult = async (
    value: number,
    presetsType: PresetsType,
    calculationList: CalculationListItem[],
    exercise: Exercise,
    totalMultiplier: number
  ) => {
    const updatedSet = { ...operatingSet };

    if (presetsType === "equipment") {
      updatedSet.weight = value;
    } else {
      updatedSet.distance = value;
    }

    operatingSetInputs.setTrackingValuesInputStrings(updatedSet);
    setOperatingSet(updatedSet);

    if (!operatingSetInputs.isSetEdited)
      operatingSetInputs.setIsSetEdited(true);

    // TODO: SAVE CALCULATION STRING

    calculationModal.calculationModal.onClose();
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header={operationType === "delete" ? "Delete Multiset" : "Remove Set"}
        body={
          operationType === "delete" ? (
            <p className="break-words">
              Are you sure you want to permanently delete the Multiset
              containing{" "}
              <span className="text-secondary">
                {operatingMultiset.setListText}
              </span>
              ?
            </p>
          ) : operatingMultiset.setList.length === 1 &&
            operationType === "edit" ? (
            // If trying to delete last Set in Multiset
            <p className="break-words">
              Are you sure you want to remove{" "}
              <span className="text-secondary">
                {operatingSet.exercise_name}
              </span>{" "}
              and permanently delete Multiset?
            </p>
          ) : (
            <p className="break-words">
              Are you sure you want to remove{" "}
              <span className="text-secondary">
                {operatingSet.exercise_name}
              </span>{" "}
              from{" "}
              <span className="text-secondary">
                {operatingMultiset.setListText}
              </span>{" "}
              Multiset?
            </p>
          )
        }
        deleteButtonAction={
          operationType === "delete" ? deleteMultiset : removeSetFromMultiset
        }
      />
      <MultisetModal
        multisetModal={multisetModal}
        multiset={operatingMultiset}
        setMultiset={setOperatingMultiset}
        operatingSet={operatingSet}
        setOperatingSet={setOperatingSet}
        operationType={operationType}
        handleClickExercise={handleClickExercise}
        useMultisetActions={multisetActions}
        exerciseList={exerciseList}
        userSettings={userSettings}
        saveButtonAction={
          operationType === "edit" ? updateMultiset : createMultiset
        }
        updateOperatingSet={multisetActions.updateOperatingSet}
        handleClickMultiset={() => {}}
        showWorkoutItems={false}
        operatingSetInputs={operatingSetInputs}
        undoOperatingMultisetChanges={
          multisetActions.undoOperatingMultisetChanges
        }
        setPresetsType={presetsList.setPresetsType}
        calculationModal={calculationModal}
      />
      {userSettings.show_calculation_buttons === 1 && (
        <CalculationModal
          useCalculationModal={calculationModal}
          usePresetsList={presetsList}
          doneButtonAction={addCalculationResult}
          weightUnit={operatingSet.weight_unit}
          distanceUnit={operatingSet.distance_unit}
          multiplierIncrement={
            userSettings.default_increment_calculation_multiplier
          }
        />
      )}
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Multiset Templates"
          filterQuery={multisetActions.filterQuery}
          setFilterQuery={multisetActions.setFilterQuery}
          filteredListLength={multisetActions.filteredMultisets.length}
          totalListLength={multisetActions.multisets.length}
          bottomContent={
            <div className="flex justify-between gap-1 w-full items-center">
              <Button
                color="secondary"
                variant="flat"
                onPress={handleCreateNewMultisetButton}
                size="sm"
              >
                Create New Multiset
              </Button>
            </div>
          }
        />
        <MultisetAccordion
          multisets={multisetActions.filteredMultisets}
          handleMultisetAccordionClick={handleMultisetAccordionClick}
          handleMultisetOptionSelection={handleMultisetOptionSelection}
          multisetTypeMap={multisetActions.multisetTypeMap}
          handleMultisetSetOptionSelection={
            multisetActions.handleMultisetSetOptionSelection
          }
        />
      </div>
    </>
  );
}
