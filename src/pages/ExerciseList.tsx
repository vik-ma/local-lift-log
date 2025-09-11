import Database from "@tauri-apps/plugin-sql";
import { useEffect, useRef, useState } from "react";
import { Exercise, ExerciseSortCategory, UserSettings } from "../typings";
import {
  CreateDefaultExercises,
  DeleteItemFromList,
  UpdateItemInList,
  FormatSetsCompletedString,
  GetUserSettings,
  FormatNumItemsString,
  UpdateExercise,
  LoadStore,
  GetSortCategoryFromStore,
  ValidateAndModifyUserSettings,
  HandleListPaginationPageChange,
} from "../helpers";
import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
} from "@heroui/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  DeleteModal,
  EmptyListLabel,
  ExerciseListOptions,
  ExerciseModal,
  FavoriteButton,
  FilterExerciseGroupsModal,
  ListFilters,
  ListPageSearchInput,
  LoadingSpinner,
} from "../components";
import { VerticalMenuIcon } from "../assets";
import { useExerciseList } from "../hooks";
import { Store } from "@tauri-apps/plugin-store";
import { DEFAULT_EXERCISE } from "../constants";

type OperationType = "add" | "edit" | "delete";

const STORE_LIST_PREFIX = "exercises";

export default function ExerciseList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [operatingExercise, setOperatingExercise] =
    useState<Exercise>(DEFAULT_EXERCISE);

  const store = useRef<Store>(null);

  const exerciseList = useExerciseList({
    store: store,
    showTotalNumSets: true,
  });

  const {
    exercises,
    setExercises,
    getExercises,
    toggleFavorite,
    sortExercisesByActiveCategory,
    isExerciseListLoaded,
    exerciseGroupDictionary,
    loadExerciseList,
    filterQuery,
    setFilterQuery,
    filteredExercises,
    exerciseListFilters,
    showSecondaryGroups,
    paginationPage,
    setPaginationPage,
    paginatedExercises,
    totalPaginationPages,
  } = exerciseList;

  const { filterMap, removeFilter, prefixMap } = exerciseListFilters;

  const deleteModal = useDisclosure();
  const exerciseModal = useDisclosure();

  const navigate = useNavigate();

  const addExercise = async (exercise: Exercise) => {
    if (operationType !== "add") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into exercises 
          (name, exercise_group_set_string_primary, 
          exercise_group_map_string_secondary, note, is_favorite,
          chart_load_exercise_options, chart_load_exercise_options_categories) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          exercise.name,
          exercise.exercise_group_set_string_primary,
          exercise.exercise_group_map_string_secondary,
          exercise.note,
          exercise.is_favorite,
          exercise.chart_load_exercise_options,
          exercise.chart_load_exercise_options_categories,
        ]
      );

      if (result.lastInsertId === undefined) return;

      exercise.id = result.lastInsertId;

      sortExercisesByActiveCategory([...exercises, exercise]);

      resetOperatingExercise();
      toast.success("Exercise Created");
      exerciseModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const updateExercise = async (exercise: Exercise) => {
    if (exercise.id === 0 || operationType !== "edit") return;

    const success = await UpdateExercise(exercise);

    if (!success) return;

    const updatedExercises = UpdateItemInList(exercises, exercise);

    sortExercisesByActiveCategory(updatedExercises);

    resetOperatingExercise();
    toast.success("Exercise Updated");
    exerciseModal.onClose();
  };

  const deleteExercise = async (exerciseToDelete?: Exercise) => {
    const exercise = exerciseToDelete ?? operatingExercise;

    if (exercise.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from exercises WHERE id = $1", [exercise.id]);

      const updatedExercises = DeleteItemFromList(exercises, exercise.id);

      setExercises(updatedExercises);

      toast.success("Exercise Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingExercise();
    deleteModal.onClose();
  };

  const restoreDefaultExercises = async () => {
    await CreateDefaultExercises();

    const sortCategory = await GetSortCategoryFromStore(
      store,
      "favorite" as ExerciseSortCategory,
      STORE_LIST_PREFIX
    );

    await getExercises(sortCategory);
    toast.success("Default Exercises Restored");
  };

  const handleCreateNewExerciseButton = () => {
    if (operationType !== "add") {
      resetOperatingExercise();
    }
    exerciseModal.onOpen();
  };

  const resetOperatingExercise = () => {
    setOperationType("add");
    setOperatingExercise(DEFAULT_EXERCISE);
  };

  const handleExerciseOptionSelection = (key: string, exercise: Exercise) => {
    if (userSettings === undefined) return;

    switch (key) {
      case "edit": {
        setOperationType("edit");
        setOperatingExercise(exercise);
        exerciseModal.onOpen();
        break;
      }
      case "delete": {
        if (userSettings.never_show_delete_modal) {
          deleteExercise(exercise);
        } else {
          setOperationType("delete");
          setOperatingExercise(exercise);
          deleteModal.onOpen();
        }
        break;
      }
      case "toggle-favorite": {
        toggleFavorite(exercise);
        break;
      }
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      ValidateAndModifyUserSettings(
        userSettings,
        new Set(["pagination_items"])
      );

      setUserSettings(userSettings);

      await LoadStore(store);

      const isExerciseListInModal = false;

      await loadExerciseList(userSettings, isExerciseListInModal);
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (userSettings === undefined || !isExerciseListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Exercise"
        body={
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="text-secondary truncate max-w-[23rem] inline-block align-top">
              {operatingExercise.name}
            </span>
            {operatingExercise.set_count! > 0 && (
              <>
                , that has{" "}
                <span className="text-secondary">
                  {FormatNumItemsString(operatingExercise.set_count, "set")}{" "}
                  completed
                </span>
              </>
            )}
            ?
          </p>
        }
        deleteButtonAction={deleteExercise}
      />
      <ExerciseModal
        exerciseModal={exerciseModal}
        exercise={operatingExercise}
        setExercise={setOperatingExercise}
        exerciseGroupDictionary={exerciseGroupDictionary}
        buttonAction={operationType === "edit" ? updateExercise : addExercise}
        resetInputsAfterSaving
      />
      <FilterExerciseGroupsModal useExerciseList={exerciseList} />
      <div className="flex flex-col items-center gap-1 pb-1.5">
        <ListPageSearchInput
          header="Exercise List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredExercises.length}
          totalListLength={exercises.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-1 w-full items-center">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={() => handleCreateNewExerciseButton()}
                  size="sm"
                >
                  New Exercise
                </Button>
                <ExerciseListOptions
                  useExerciseList={exerciseList}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                />
              </div>
              {filterMap.size > 0 && (
                <ListFilters
                  filterMap={filterMap}
                  removeFilter={removeFilter}
                  prefixMap={prefixMap}
                />
              )}
            </div>
          }
        />
        <div className="flex flex-col gap-1 w-full">
          {paginatedExercises.map((exercise) => (
            <div
              className="flex justify-between items-center bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
              key={exercise.id}
            >
              <button
                className="flex flex-col justify-start items-start pl-2 py-1"
                onClick={() => navigate(`/exercises/${exercise.id}`)}
              >
                <span className="w-[18.5rem] truncate text-left">
                  {exercise.name}
                </span>
                {exercise.set_count! > 0 && (
                  <span className="text-xs text-secondary text-left">
                    {FormatSetsCompletedString(exercise.set_count)}
                  </span>
                )}
                {!showSecondaryGroups ? (
                  <span className="text-xs text-stone-400 text-left">
                    {exercise.formattedGroupStringPrimary}
                  </span>
                ) : (
                  <>
                    <span className="text-xs text-stone-400 text-left">
                      <span className="font-medium text-stone-600">
                        Primary:
                      </span>{" "}
                      {exercise.formattedGroupStringPrimary}
                    </span>
                    {exercise.formattedGroupStringSecondary !== undefined && (
                      <span className="text-xs text-stone-400 text-left">
                        <span className="font-medium text-stone-600">
                          Secondary:
                        </span>{" "}
                        {exercise.formattedGroupStringSecondary}
                      </span>
                    )}
                  </>
                )}
                <span className="w-[18rem] break-all text-xs text-slate-400 text-left">
                  {exercise.note}
                </span>
              </button>
              <div className="flex items-center gap-0.5 pr-1">
                <FavoriteButton
                  name={exercise.name}
                  isFavorite={!!exercise.is_favorite}
                  item={exercise}
                  toggleFavorite={toggleFavorite}
                />
                <Dropdown shouldBlockScroll={false}>
                  <DropdownTrigger>
                    <Button
                      aria-label={`Toggle ${exercise.name} Options Menu`}
                      isIconOnly
                      className="z-1"
                      radius="lg"
                      variant="light"
                    >
                      <VerticalMenuIcon size={19} color="#888" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={`Options Menu For ${exercise.name} Exercise`}
                    onAction={(key) =>
                      handleExerciseOptionSelection(key as string, exercise)
                    }
                  >
                    <DropdownItem key="edit" className="text-slate-400">
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="toggle-favorite"
                      className="text-secondary"
                    >
                      {exercise.is_favorite
                        ? "Remove Favorite"
                        : "Set Favorite"}
                    </DropdownItem>
                    <DropdownItem key="delete" className="text-danger">
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          ))}
          {filteredExercises.length === 0 && (
            <EmptyListLabel itemName="Exercises" />
          )}
        </div>
        {totalPaginationPages > 1 && (
          <div className="pt-0.5">
            <Pagination
              size="lg"
              showControls
              page={paginationPage}
              total={totalPaginationPages}
              onChange={(value) =>
                HandleListPaginationPageChange(
                  value,
                  store,
                  setPaginationPage,
                  STORE_LIST_PREFIX
                )
              }
            />
          </div>
        )}
        <div className="flex justify-center pt-0.5">
          <Button variant="flat" onPress={restoreDefaultExercises}>
            Restore Default Exercises
          </Button>
        </div>
      </div>
    </>
  );
}
