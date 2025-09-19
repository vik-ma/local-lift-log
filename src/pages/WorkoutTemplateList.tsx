import Database from "@tauri-apps/plugin-sql";
import { UserSettings, WorkoutTemplate } from "../typings";
import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import {
  LoadingSpinner,
  DeleteModal,
  WorkoutTemplateModal,
  ListPageSearchInput,
  EmptyListLabel,
  FilterWorkoutTemplateListModal,
  ListFilters,
  WorkoutTemplateListOptions,
  FilterExerciseGroupsModal,
} from "../components";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useExerciseList, useWorkoutTemplateList } from "../hooks";
import {
  DeleteItemFromList,
  UpdateItemInList,
  UpdateWorkoutTemplate,
  FormatNumItemsString,
  GetUniqueMultisetIds,
  DeleteMultisetWithId,
  GetUserSettings,
  LoadStore,
  ValidateAndModifyUserSettings,
} from "../helpers";
import { VerticalMenuIcon } from "../assets";
import { Store } from "@tauri-apps/plugin-store";
import { DEFAULT_WORKOUT_TEMPLATE } from "../constants";

type OperationType = "add" | "edit" | "delete";

export default function WorkoutTemplateList() {
  const [operationType, setOperationType] = useState<OperationType>("edit");
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operatingWorkoutTemplate, setOperatingWorkoutTemplate] =
    useState<WorkoutTemplate>(DEFAULT_WORKOUT_TEMPLATE);

  const store = useRef<Store>(null);

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const workoutTemplateModal = useDisclosure();

  const exerciseList = useExerciseList({ store: store });

  const workoutTemplateList = useWorkoutTemplateList({
    store: store,
    useExerciseList: exerciseList,
  });

  const {
    workoutTemplates,
    setWorkoutTemplates,
    filterQuery,
    setFilterQuery,
    filteredWorkoutTemplates,
    listFilters,
    isWorkoutTemplateListLoaded,
    sortWorkoutTemplatesByActiveCategory,
    loadWorkoutTemplateList,
  } = workoutTemplateList;

  const { filterMap, removeFilter, prefixMap } = listFilters;

  useEffect(() => {
    const loadPage = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      ValidateAndModifyUserSettings(
        userSettings,
        new Set(["locale", "pagination_items"])
      );

      setUserSettings(userSettings);

      await LoadStore(store);

      const isWorkoutTemplateListInModal = false;

      await loadWorkoutTemplateList(userSettings, isWorkoutTemplateListInModal);
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addWorkoutTemplate = async (workoutTemplate: WorkoutTemplate) => {
    if (workoutTemplate.id !== 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into workout_templates (name, exercise_order, note) VALUES ($1, $2, $3)",
        [
          workoutTemplate.name,
          workoutTemplate.exercise_order,
          workoutTemplate.note,
        ]
      );

      if (result.lastInsertId === undefined) return;

      navigate(`/workout-templates/${result.lastInsertId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteWorkoutTemplate = async (
    workoutTemplateToDelete?: WorkoutTemplate
  ) => {
    const workoutTemplate = workoutTemplateToDelete ?? operatingWorkoutTemplate;

    if (workoutTemplate.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from workout_templates WHERE id = $1", [
        workoutTemplate.id,
      ]);

      const isTemplate = true;

      const workoutTemplateMultisetIds = await GetUniqueMultisetIds(
        workoutTemplate.id,
        isTemplate
      );

      // Delete all multisets in workout
      for (const multisetId of workoutTemplateMultisetIds) {
        await DeleteMultisetWithId(multisetId);
      }

      // Delete all sets referencing workout_template
      db.execute(
        "DELETE from sets WHERE workout_template_id = $1 AND is_template = 1",
        [workoutTemplate.id]
      );

      const updatedWorkoutTemplates = DeleteItemFromList(
        workoutTemplates,
        workoutTemplate.id
      );

      setWorkoutTemplates(updatedWorkoutTemplates);

      toast.success("Workout Template Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingWorkoutTemplate();
    deleteModal.onClose();
  };

  const updateWorkoutTemplate = async (workoutTemplate: WorkoutTemplate) => {
    if (workoutTemplate.id === 0 || operationType !== "edit") return;

    const success = await UpdateWorkoutTemplate(workoutTemplate);

    if (!success) return;

    const updatedWorkoutTemplates = UpdateItemInList(
      workoutTemplates,
      workoutTemplate
    );

    sortWorkoutTemplatesByActiveCategory(updatedWorkoutTemplates);

    resetOperatingWorkoutTemplate();
    workoutTemplateModal.onClose();
  };

  const resetOperatingWorkoutTemplate = () => {
    setOperatingWorkoutTemplate(DEFAULT_WORKOUT_TEMPLATE);
    setOperationType("add");
  };

  const handleWorkoutTemplateOptionSelection = (
    key: string,
    workoutTemplate: WorkoutTemplate
  ) => {
    if (userSettings === undefined) return;

    switch (key) {
      case "edit": {
        setOperationType("edit");
        setOperatingWorkoutTemplate(workoutTemplate);
        workoutTemplateModal.onOpen();
        break;
      }
      case "delete": {
        if (
          workoutTemplate.numSets === 0 ||
          !!userSettings.never_show_delete_modal
        ) {
          deleteWorkoutTemplate(workoutTemplate);
        } else {
          setOperationType("delete");
          setOperatingWorkoutTemplate(workoutTemplate);
          deleteModal.onOpen();
        }
        break;
      }
    }
  };

  const handleCreateNewWorkoutTemplateButton = () => {
    if (operationType !== "add") {
      resetOperatingWorkoutTemplate();
    }
    workoutTemplateModal.onOpen();
  };

  const handleClickWorkoutTemplate = (workoutTemplate: WorkoutTemplate) => {
    navigate(`/workout-templates/${workoutTemplate.id}`);
  };

  if (userSettings === undefined || !isWorkoutTemplateListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <WorkoutTemplateModal
        workoutTemplateModal={workoutTemplateModal}
        workoutTemplate={operatingWorkoutTemplate}
        buttonAction={
          operationType === "edit" ? updateWorkoutTemplate : addWorkoutTemplate
        }
      />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Workout Template"
        body={
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="text-secondary truncate max-w-[23rem] inline-block align-top">
              {operatingWorkoutTemplate.name}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteWorkoutTemplate}
      />
      <FilterWorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        useExerciseList={exerciseList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterExerciseGroupsModal useExerciseList={exerciseList} />
      <div className="flex flex-col items-center gap-1 pb-1.5">
        <ListPageSearchInput
          header="Workout Templates"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredWorkoutTemplates.length}
          totalListLength={workoutTemplates.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  size="sm"
                  variant="flat"
                  onPress={handleCreateNewWorkoutTemplateButton}
                >
                  New Workout Template
                </Button>
                <WorkoutTemplateListOptions
                  useWorkoutTemplateList={workoutTemplateList}
                  userSettings={userSettings}
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
          {filteredWorkoutTemplates.map((template) => (
            <div
              className="flex justify-between items-center bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
              key={template.id}
            >
              <button
                className="flex flex-col justify-start items-start pl-2 py-1"
                onClick={() => handleClickWorkoutTemplate(template)}
              >
                <span className="w-[21rem] truncate text-left">
                  {template.name}
                </span>
                {template.numSets! > 0 ? (
                  <span className="text-xs text-secondary text-left">
                    {FormatNumItemsString(
                      template.exerciseIdSet !== undefined
                        ? template.exerciseIdSet.size
                        : 0,
                      "Exercise"
                    )}
                    , {FormatNumItemsString(template.numSets, "Set")}
                  </span>
                ) : (
                  <span className="text-xs text-stone-400 text-left">
                    Empty
                  </span>
                )}
                <span className="w-[21rem] break-all text-xs text-slate-400 text-left">
                  {template.note}
                </span>
              </button>
              <div className="flex items-center gap-0.5 pr-1">
                <Dropdown shouldBlockScroll={false}>
                  <DropdownTrigger>
                    <Button
                      aria-label={`Toggle ${template.name} Options Menu`}
                      isIconOnly
                      className="z-1"
                      radius="lg"
                      variant="light"
                    >
                      <VerticalMenuIcon size={19} color="#888" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={`Options Menu For ${template.name} Workout Template`}
                    onAction={(key) =>
                      handleWorkoutTemplateOptionSelection(
                        key as string,
                        template
                      )
                    }
                  >
                    <DropdownItem key="edit" className="text-slate-400">
                      Edit
                    </DropdownItem>
                    <DropdownItem key="delete" className="text-danger">
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          ))}
          {filteredWorkoutTemplates.length === 0 && (
            <EmptyListLabel itemName="Workout Templates" />
          )}
        </div>
      </div>
    </>
  );
}
