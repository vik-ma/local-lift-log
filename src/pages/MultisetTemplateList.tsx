import { useState, useEffect, useRef } from "react";
import {
  Multiset,
  Exercise,
  WorkoutSet,
  UserSettings,
  PresetsType,
  CalculationListItem,
  UseSetTrackingInputsReturnType,
} from "../typings";
import {
  useCalculationModal,
  useExerciseList,
  useMultisetActions,
  usePresetsList,
} from "../hooks";
import { Button, useDisclosure } from "@heroui/react";
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
  UpdateCalculationString,
  LoadStore,
  ValidateAndModifyUserSettings,
  CreateDefaultSet,
} from "../helpers";
import {
  CalculationModal,
  DeleteModal,
  FilterExerciseGroupsModal,
  FilterMultisetListModal,
  FilterPresetsListModal,
  ListFilters,
  ListPageSearchInput,
  LoadingSpinner,
  MultisetAccordions,
  MultisetListOptions,
  MultisetModal,
} from "../components";
import toast from "react-hot-toast";
import { Store } from "@tauri-apps/plugin-store";
import { DEFAULT_MULTISET } from "../constants";

export type OperationType = "add" | "edit" | "delete";

const IS_SET_TEMPLATE = true;

export default function Multisets() {
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const defaultMultiset = DEFAULT_MULTISET;

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const defaultSet = useRef<WorkoutSet>(CreateDefaultSet(IS_SET_TEMPLATE));

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(
    defaultSet.current
  );

  const store = useRef<Store>(null);

  const deleteModal = useDisclosure();

  const exerciseList = useExerciseList({ store: store });

  const calculationModal = useCalculationModal();

  const presetsList = usePresetsList({ store: store });

  const removeSetFromMultiset = async (
    setToDelete?: WorkoutSet,
    multisetTarget?: Multiset
  ) => {
    const set = setToDelete ?? operatingSet;
    const multiset = multisetTarget ?? operatingMultiset;

    if (set.id === 0) return;

    const deleteSetSuccess = await DeleteSetWithId(set.id);

    if (!deleteSetSuccess) return;

    const updatedSetList = DeleteItemFromList(multiset.setList, set.id);

    multiset.setList = updatedSetList;

    const setListIdOrder = updatedSetList.map((obj) => obj.id);

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      multiset,
      [setListIdOrder]
    );

    if (!success) return;

    let toastMsg = "Set Removed";

    let updatedMultisets: Multiset[] = [];

    if (updatedMultiset.setList.length === 0) {
      // Delete Multiset if last set was deleted
      const deleteMultisetSuccess = await DeleteMultisetWithId(multiset.id);

      if (!deleteMultisetSuccess) return;

      updatedMultisets = DeleteItemFromList(
        multisetActions.multisets,
        multiset.id
      );

      toastMsg = "Multiset Deleted";

      if (multisetActions.multisetModal.isOpen) {
        multisetActions.multisetModal.onClose();
      }
    } else {
      updatedMultisets = UpdateItemInList(
        multisetActions.multisets,
        updatedMultiset
      );
    }

    multisetActions.setMultisets(updatedMultisets);

    if (!multisetActions.multisetModal.isOpen) {
      resetOperatingMultiset();
    }

    deleteModal.onClose();
    toast.success(toastMsg);
  };

  const multisetActions = useMultisetActions({
    operatingMultiset,
    setOperatingMultiset,
    operatingSet,
    setOperatingSet,
    deleteModal,
    exerciseList,
    defaultMultiset,
    store,
    userSettings,
    removeSetFromMultiset,
  });

  useEffect(() => {
    const loadPage = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      ValidateAndModifyUserSettings(
        userSettings,
        new Set([
          "default_unit_weight",
          "default_unit_distance",
          "locale",
          "time_input",
          "increment_multipliers",
        ])
      );

      setUserSettings(userSettings);

      const emptySet: WorkoutSet = {
        ...defaultSet.current,
        weight_unit: userSettings.default_unit_weight,
        distance_unit: userSettings.default_unit_distance,
        user_weight_unit: userSettings.default_unit_weight,
      };

      defaultSet.current = emptySet;

      setOperatingSet({ ...emptySet });

      await LoadStore(store);

      await multisetActions.loadMultisets(userSettings);
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNewMultisetButton = () => {
    if (operationType !== "add") {
      resetOperatingMultiset();
    }
    multisetActions.multisetModal.onOpen();
  };

  const resetOperatingMultiset = () => {
    setOperationType("add");
    setOperatingMultiset(defaultMultiset);
    setOperatingSet({ ...defaultSet.current });
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
      exercise.formattedGroupStringPrimary ?? ""
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

  const createMultiset = async (noteInput: string) => {
    if (operationType !== "add") return;

    const noteToInsert = ConvertEmptyStringToNull(noteInput);

    operatingMultiset.note = noteToInsert;

    const multisetId = await InsertMultisetIntoDatabase(operatingMultiset);

    if (multisetId === 0) return;

    operatingMultiset.id = multisetId;

    const setListIdOrder: number[] = [];

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      operatingMultiset.setList[i].multiset_id = multisetId;
      operatingMultiset.setList[i].isEditedInMultiset = false;

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
    multisetActions.multisetModal.onClose();
    toast.success("Multiset Created");
  };

  const updateMultiset = async (noteInput: string) => {
    if (!operatingMultiset.isEditedInModal) {
      resetOperatingMultiset();
      multisetActions.multisetModal.onClose();
      return;
    }

    if (operationType !== "edit" || operatingMultiset.id === 0) return;

    const noteToInsert = ConvertEmptyStringToNull(noteInput);

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
      }

      operatingMultiset.setList[i].isEditedInMultiset = false;

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
    multisetActions.multisetModal.onClose();
    toast.success("Multiset Updated");
  };

  const deleteMultiset = async (multisetToDelete?: Multiset) => {
    const multiset = multisetToDelete ?? operatingMultiset;

    if (multiset.id === 0) return;

    const success = await DeleteMultisetWithId(multiset.id);

    if (!success) return;

    const updatedMultisets = DeleteItemFromList(
      multisetActions.multisets,
      multiset.id
    );

    multisetActions.setMultisets(updatedMultisets);

    resetOperatingMultiset();
    toast.success("Multiset Deleted");
    deleteModal.onClose();
  };

  const handleMultisetAccordionsClick = (multiset: Multiset, index: number) => {
    const updatedMultiset: Multiset = {
      ...multiset,
      isExpanded: !multiset.isExpanded,
    };

    const updatedMultisets = [...multisetActions.multisets];
    updatedMultisets[index] = updatedMultiset;

    multisetActions.setMultisets(updatedMultisets);
  };

  const handleMultisetOptionSelection = (key: string, multiset: Multiset) => {
    if (userSettings === undefined) return;

    switch (key) {
      case "edit": {
        setOperationType("edit");
        multisetActions.clearMultiset("base", { ...multiset });
        multisetActions.setUneditedMultiset({ ...multiset });
        multisetActions.multisetModal.onOpen();
        break;
      }
      case "delete": {
        if (userSettings.never_show_delete_modal) {
          deleteMultiset(multiset);
        } else {
          setOperatingMultiset(multiset);
          setOperationType("delete");
          deleteModal.onOpen();
        }
        break;
      }
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

    // Needed for useEffect in SetValueConfig to trigger change in inputs
    if (updatedSet.addCalculationTrigger === undefined) {
      updatedSet.addCalculationTrigger = 0;
    } else {
      updatedSet.addCalculationTrigger++;
    }

    setOperatingSet(updatedSet);

    if (userSettings?.save_calculation_string === 1) {
      const { success, updatedExercise } = await UpdateCalculationString(
        calculationList,
        presetsType,
        exercise,
        totalMultiplier
      );

      if (!success) return;

      const updatedExercises = UpdateItemInList(
        exerciseList.exercises,
        updatedExercise
      );

      exerciseList.setExercises(updatedExercises);

      if (multisetActions.selectedMultisetExercise.id === exercise.id) {
        multisetActions.setSelectedMultisetExercise(updatedExercise);
      }
    }

    calculationModal.calculationModal.onClose();
  };

  const openCalculationModal = async (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet
  ) => {
    if (userSettings === undefined) return;

    await calculationModal.openCalculationModal(
      isWeight,
      exercise,
      isActiveSet,
      setInputs,
      set,
      presetsList,
      userSettings
    );
  };

  if (
    userSettings === undefined ||
    !multisetActions.isMultisetListLoaded.current
  )
    return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header={operationType === "delete" ? "Delete Multiset" : "Remove Set"}
        body={
          operationType === "delete" ? (
            <p className="max-h-[382px] overflow-hidden">
              Are you sure you want to permanently delete the Multiset
              containing the following {operatingMultiset.setList.length}{" "}
              exercises?
              <div className="flex flex-col text-secondary pt-1">
                {operatingMultiset.setList.map((item) => (
                  <span className="truncate max-w-[24rem]">
                    {item.exercise_name}
                  </span>
                ))}
              </div>
            </p>
          ) : operatingMultiset.setList.length === 1 &&
            operationType === "edit" ? (
            // If trying to delete last Set in Multiset
            <p>
              Are you sure you want to remove{" "}
              <span className="text-secondary truncate max-w-[24rem] inline-block align-top">
                {operatingSet.exercise_name}
              </span>{" "}
              and permanently delete Multiset?
            </p>
          ) : (
            <p className="max-h-[386px] overflow-hidden">
              Are you sure you want to remove set of the following exercise from
              Multiset?
              <div className="pt-1">
                <span className="font-medium">Exercise</span>
                <br />
                <span className="text-secondary truncate max-w-[24rem] inline-block align-top">
                  {operatingSet.exercise_name}
                </span>
              </div>
              <div className="pt-1">
                <span className="font-medium">Multiset</span>
                <div className="flex flex-col text-secondary pt-px">
                  {operatingMultiset.setList.map((item) => (
                    <span className="truncate max-w-[24rem]">
                      {item.exercise_name}
                    </span>
                  ))}
                </div>
              </div>
            </p>
          )
        }
        deleteButtonAction={
          operationType === "delete" ? deleteMultiset : removeSetFromMultiset
        }
      />
      <MultisetModal
        multiset={operatingMultiset}
        setMultiset={setOperatingMultiset}
        operatingSet={operatingSet}
        setOperatingSet={setOperatingSet}
        operationType={operationType}
        handleClickExercise={handleClickExercise}
        useMultisetActions={multisetActions}
        exerciseList={exerciseList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        saveButtonAction={
          operationType === "edit" ? updateMultiset : createMultiset
        }
        handleClickMultiset={() => {}}
        showWorkoutItems={false}
        openCalculationModal={openCalculationModal}
      />
      <FilterExerciseGroupsModal useExerciseList={exerciseList} />
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
      {userSettings.show_calculation_buttons === 1 && (
        <CalculationModal
          useCalculationModal={calculationModal}
          usePresetsList={presetsList}
          doneButtonAction={addCalculationResult}
          userSettings={userSettings}
          setUserSettings={setUserSettings}
        />
      )}
      <div className="flex flex-col items-center gap-1 pb-1.5">
        <ListPageSearchInput
          header="Multiset Templates"
          filterQuery={multisetActions.filterQuery}
          setFilterQuery={multisetActions.setFilterQuery}
          filteredListLength={multisetActions.filteredMultisets.length}
          totalListLength={multisetActions.multisets.length}
          isListFiltered={multisetActions.listFilters.filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleCreateNewMultisetButton}
                  size="sm"
                >
                  Create New Multiset
                </Button>
                <MultisetListOptions
                  useMultisetActions={multisetActions}
                  userSettings={userSettings}
                />
              </div>
              {multisetActions.listFilters.filterMap.size > 0 && (
                <ListFilters
                  filterMap={multisetActions.listFilters.filterMap}
                  removeFilter={multisetActions.listFilters.removeFilter}
                  prefixMap={multisetActions.listFilters.prefixMap}
                />
              )}
            </div>
          }
        />
        <MultisetAccordions
          useMultisetActions={multisetActions}
          handleMultisetAccordionsClick={handleMultisetAccordionsClick}
          handleMultisetOptionSelection={handleMultisetOptionSelection}
        />
      </div>
    </>
  );
}
