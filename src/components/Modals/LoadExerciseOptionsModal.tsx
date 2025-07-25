import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Checkbox,
  ScrollShadow,
  Select,
  SelectItem,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  SharedSelection,
  Chip,
} from "@heroui/react";
import {
  ChartDataCategory,
  ChartDataCategoryNoUndefined,
  ChartDataExerciseCategoryBase,
  ChartDataUnitCategory,
  ChartDataUnitCategoryNoUndefined,
  Exercise,
  UseDisclosureReturnType,
  UseExerciseListReturnType,
  UseExerciseListFiltersReturnType,
  UserSettings,
} from "../../typings";
import { useMemo, useState } from "react";
import {
  CreateLoadExerciseOptionsList,
  ValidLoadExerciseOptionsCategories,
} from "../../helpers";
import { ExerciseModalList } from "..";

type LoadExerciseOptionsModalProps = {
  loadExerciseOptionsModal: UseDisclosureReturnType;
  selectedExercise: Exercise | undefined;
  setSelectedExercise: React.Dispatch<
    React.SetStateAction<Exercise | undefined>
  >;
  chartDataUnitCategoryMap: Map<ChartDataCategory, ChartDataUnitCategory>;
  loadedCharts: Set<ChartDataCategoryNoUndefined>;
  chartDataAreas: ChartDataCategory[];
  loadExerciseOptionsMap: Map<ChartDataExerciseCategoryBase, string>;
  secondaryDataUnitCategory: ChartDataUnitCategory;
  useExerciseList: UseExerciseListReturnType;
  useExerciseListFilters: UseExerciseListFiltersReturnType;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  loadExerciseStats: (
    exercise: Exercise,
    loadExerciseOptions: Set<ChartDataExerciseCategoryBase>,
    loadExerciseOptionsUnitCategoryPrimary: ChartDataUnitCategory,
    loadExerciseOptionsUnitCategorySecondary: ChartDataUnitCategory,
    ignoreWarmups: boolean,
    ignoreMultisets: boolean
  ) => Promise<void>;
};

export const LoadExerciseOptionsModal = ({
  loadExerciseOptionsModal,
  selectedExercise,
  setSelectedExercise,
  chartDataUnitCategoryMap,
  loadedCharts,
  chartDataAreas,
  loadExerciseOptionsMap,
  secondaryDataUnitCategory,
  useExerciseList,
  useExerciseListFilters,
  userSettings,
  setUserSettings,
  loadExerciseStats,
}: LoadExerciseOptionsModalProps) => {
  const [filterCategories, setFilterCategories] = useState<
    Set<ChartDataUnitCategory>
  >(new Set());
  const [ignoreWarmups, setIgnoreWarmups] = useState<boolean>(true);
  const [ignoreMultisets, setIgnoreMultisets] = useState<boolean>(false);
  const [loadExerciseOptions, setLoadExerciseOptions] = useState<
    Set<ChartDataExerciseCategoryBase>
  >(new Set());
  const [
    loadExerciseOptionsUnitCategoryPrimary,
    setLoadExerciseOptionsUnitCategoryPrimary,
  ] = useState<ChartDataUnitCategory>();
  const [
    loadExerciseOptionsUnitCategorySecondary,
    setLoadExerciseOptionsUnitCategorySecondary,
  ] = useState<ChartDataUnitCategory>();
  const [
    loadExerciseOptionsUnitCategoriesPrimary,
    setLoadExerciseOptionsUnitCategoriesPrimary,
  ] = useState<Set<ChartDataUnitCategory>>(new Set());
  const [
    loadExerciseOptionsUnitCategoriesSecondary,
    setLoadExerciseOptionsUnitCategoriesSecondary,
  ] = useState<ChartDataUnitCategory[]>([]);
  const [disabledLoadExerciseOptions, setDisabledLoadExerciseOptions] =
    useState<Set<ChartDataExerciseCategoryBase>>(new Set());

  const validLoadExerciseOptionsCategories =
    ValidLoadExerciseOptionsCategories();

  const filteredLoadExerciseOptionsMap = useMemo(() => {
    if (filterCategories.size > 0) {
      return new Map(
        [...loadExerciseOptionsMap].filter(
          ([key]) =>
            filterCategories.has(
              chartDataUnitCategoryMap.get(key as ChartDataCategory)
            ) || loadExerciseOptions.has(key)
        )
      );
    }
    return loadExerciseOptionsMap;
  }, [
    filterCategories,
    loadExerciseOptionsMap,
    chartDataUnitCategoryMap,
    loadExerciseOptions,
  ]);

  const handleLoadExerciseOptionsChange = (
    key: ChartDataExerciseCategoryBase
  ) => {
    const updatedLoadExerciseOptions = new Set(loadExerciseOptions);

    const unitCategoryKey = chartDataUnitCategoryMap.get(key);

    let updatedUnitCategoryPrimary: ChartDataUnitCategory =
      loadExerciseOptionsUnitCategoryPrimary;

    // Set key as loadExerciseOptionsUnitCategoryPrimary if no Chart Areas exist
    // and loadExerciseOptions was previously empty
    if (chartDataAreas.length === 0 && updatedLoadExerciseOptions.size === 0) {
      updatedUnitCategoryPrimary = unitCategoryKey;
    }

    if (updatedLoadExerciseOptions.has(key)) {
      updatedLoadExerciseOptions.delete(key);
    } else {
      updatedLoadExerciseOptions.add(key);
    }

    const updatedUnitCategoriesPrimary = new Set<ChartDataUnitCategory>();

    if (updatedLoadExerciseOptions.size > 0) {
      let shouldChangeCategory = true;

      if (chartDataAreas.length > 0) {
        // Never automatically change category if any Chart Areas exist
        shouldChangeCategory = false;
        updatedUnitCategoriesPrimary.add(
          chartDataUnitCategoryMap.get(chartDataAreas[0])
        );
      }

      for (const option of updatedLoadExerciseOptions) {
        const unitCategory = chartDataUnitCategoryMap.get(option);

        updatedUnitCategoriesPrimary.add(unitCategory);

        if (unitCategory === loadExerciseOptionsUnitCategoryPrimary) {
          shouldChangeCategory = false;
        }
      }

      updatedUnitCategoriesPrimary.delete(undefined);
      setLoadExerciseOptionsUnitCategoriesPrimary(updatedUnitCategoriesPrimary);

      // Change loadExerciseOptionsUnitCategoryPrimary if last option with that category was deleted
      if (shouldChangeCategory) {
        updatedUnitCategoryPrimary = chartDataUnitCategoryMap.get(
          updatedLoadExerciseOptions.values().next().value
        );
      }
    }

    if (chartDataAreas.length > 0 && updatedLoadExerciseOptions.size === 0) {
      const chartAreaUnitCategory = chartDataUnitCategoryMap.get(
        chartDataAreas[0]
      );

      setLoadExerciseOptionsUnitCategoriesPrimary(
        new Set([chartAreaUnitCategory])
      );

      updatedUnitCategoryPrimary = chartAreaUnitCategory;
    }

    if (chartDataAreas.length === 0 && updatedLoadExerciseOptions.size === 0) {
      setLoadExerciseOptionsUnitCategoriesPrimary(new Set());
      updatedUnitCategoryPrimary = undefined;
    }

    const updatedUnitCategoriesSecondary: ChartDataUnitCategory[] = [];

    if (secondaryDataUnitCategory !== undefined) {
      updatedUnitCategoriesSecondary.push(secondaryDataUnitCategory);
    }

    updatedUnitCategoriesSecondary.push(
      ...Array.from(updatedUnitCategoriesPrimary).filter(
        (value) => value !== updatedUnitCategoryPrimary
      )
    );

    setLoadExerciseOptions(updatedLoadExerciseOptions);
    setLoadExerciseOptionsUnitCategoryPrimary(updatedUnitCategoryPrimary);
    setLoadExerciseOptionsUnitCategoriesSecondary(
      updatedUnitCategoriesSecondary
    );
    setLoadExerciseOptionsUnitCategorySecondary(
      updatedUnitCategoriesSecondary[0]
    );
  };

  const removeFilter = (key: ChartDataUnitCategory) => {
    const updatedFilterCategories = new Set(filterCategories);
    updatedFilterCategories.delete(key);
    setFilterCategories(updatedFilterCategories);
  };

  const handleClearAllButton = () => {
    setLoadExerciseOptions(new Set());

    let updatedUnitCategoryPrimary: ChartDataUnitCategory = undefined;
    const updatedUnitCategoriesPrimary = new Set<ChartDataUnitCategory>();
    const updatedUnitCategoriesSecondary: ChartDataUnitCategory[] = [];

    if (chartDataAreas.length > 0) {
      updatedUnitCategoryPrimary = chartDataUnitCategoryMap.get(
        chartDataAreas[0]
      );
      updatedUnitCategoriesPrimary.add(updatedUnitCategoryPrimary);
    }

    if (secondaryDataUnitCategory !== undefined) {
      updatedUnitCategoriesSecondary.push(secondaryDataUnitCategory);
    }

    setLoadExerciseOptionsUnitCategoryPrimary(updatedUnitCategoryPrimary);
    setLoadExerciseOptionsUnitCategoriesPrimary(updatedUnitCategoriesPrimary);
    setLoadExerciseOptionsUnitCategorySecondary(secondaryDataUnitCategory);
    setLoadExerciseOptionsUnitCategoriesSecondary(
      updatedUnitCategoriesSecondary
    );
  };

  const handleLoadExerciseOptionsUnitCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value === "" ? undefined : e.target.value;

    if (value === loadExerciseOptionsUnitCategorySecondary) {
      const updatedUnitCategoriesSecondary =
        loadExerciseOptionsUnitCategoriesSecondary.filter(
          (category) => category !== value
        );

      updatedUnitCategoriesSecondary.push(
        loadExerciseOptionsUnitCategoryPrimary
      );

      setLoadExerciseOptionsUnitCategorySecondary(
        loadExerciseOptionsUnitCategoryPrimary
      );
      setLoadExerciseOptionsUnitCategoriesSecondary(
        updatedUnitCategoriesSecondary
      );
    }

    setLoadExerciseOptionsUnitCategoryPrimary(value as ChartDataUnitCategory);
  };

  const fillInLoadExerciseOptions = (exercise: Exercise) => {
    const disabledKeys = new Set<ChartDataExerciseCategoryBase>();

    // Disable any options that have already been loaded for Exercise
    // Check if a ChartDataExerciseCategoryBase value exists for selectedExercise id
    for (const chart of loadedCharts) {
      const lastIndex = chart.lastIndexOf("_");

      if (lastIndex === -1) continue;

      const chartName = chart.substring(0, lastIndex);
      const chartId = chart.substring(lastIndex + 1);

      if (chartId === exercise.id.toString() && chartName !== "measurement") {
        disabledKeys.add(chartName as ChartDataExerciseCategoryBase);
      }
    }

    setDisabledLoadExerciseOptions(disabledKeys);

    // Create list from default string, without any disabled options
    const loadExerciseOptionsList = CreateLoadExerciseOptionsList(
      exercise.chart_load_exercise_options,
      exercise.exercise_group_set_string_primary
    ).filter((option) => !disabledKeys.has(option));

    setLoadExerciseOptions(new Set(loadExerciseOptionsList));

    const unitCategoriesPrimary: ChartDataUnitCategory[] = [];

    unitCategoriesPrimary.push(
      ...loadExerciseOptionsList.map((option) =>
        chartDataUnitCategoryMap.get(option)
      )
    );

    const savedCategories =
      exercise.chart_load_exercise_options_categories.split(
        ","
      ) as ChartDataUnitCategoryNoUndefined[];

    let unitCategoryPrimary: ChartDataUnitCategory = undefined;

    const chartAreaUnitCategory = chartDataUnitCategoryMap.get(
      chartDataAreas[0]
    );

    if (chartAreaUnitCategory !== undefined) {
      // Use Chart Area category if Chart is already loaded
      unitCategoryPrimary = chartAreaUnitCategory;
      unitCategoriesPrimary.push(chartAreaUnitCategory);
    } else {
      // Use saved category string if Chart is not loaded
      const isSavedCategoryValid =
        validLoadExerciseOptionsCategories.has(savedCategories[0]) &&
        unitCategoriesPrimary.includes(savedCategories[0]);

      // Use first unit category from saved options string if saved string is invalid
      // (Will be undefined if unitCategoriesPrimary is empty)
      unitCategoryPrimary = isSavedCategoryValid
        ? savedCategories[0]
        : unitCategoriesPrimary[0];
      unitCategoriesPrimary.push(unitCategoryPrimary);
    }

    setLoadExerciseOptionsUnitCategoryPrimary(unitCategoryPrimary);

    const unitCategorySetPrimary = new Set(unitCategoriesPrimary);

    unitCategorySetPrimary.delete(undefined);

    const unitCategoriesSecondary: ChartDataUnitCategory[] = [];

    if (secondaryDataUnitCategory !== undefined) {
      unitCategoriesSecondary.push(secondaryDataUnitCategory);
    }

    unitCategoriesSecondary.push(
      ...Array.from(unitCategorySetPrimary).filter(
        (value) => value !== unitCategoryPrimary
      )
    );

    setLoadExerciseOptionsUnitCategoriesPrimary(unitCategorySetPrimary);
    setLoadExerciseOptionsUnitCategoriesSecondary(unitCategoriesSecondary);

    let unitCategorySecondary: ChartDataUnitCategory = undefined;

    if (secondaryDataUnitCategory === undefined) {
      // Change to saved category string if no Chart Lines are loaded
      const isSavedCategoryValid =
        validLoadExerciseOptionsCategories.has(savedCategories[1]) &&
        unitCategoriesSecondary.includes(savedCategories[1]);

      // Use first unit category from non-primary saved options string
      // if saved string is invalid
      // (Will be undefined if unitCategoriesSecondary is empty)
      unitCategorySecondary = isSavedCategoryValid
        ? savedCategories[1]
        : unitCategoriesSecondary[0];

      setLoadExerciseOptionsUnitCategorySecondary(unitCategorySecondary);
    }
  };

  const handleClickExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    fillInLoadExerciseOptions(exercise);
  };

  const handleLoadButton = async () => {
    if (
      selectedExercise === undefined ||
      loadExerciseOptions.size === 0 ||
      loadExerciseOptionsUnitCategoryPrimary === undefined
    )
      return;

    await loadExerciseStats(
      selectedExercise,
      loadExerciseOptions,
      loadExerciseOptionsUnitCategoryPrimary,
      loadExerciseOptionsUnitCategorySecondary,
      ignoreWarmups,
      ignoreMultisets
    );
  };

  return (
    <Modal
      isOpen={loadExerciseOptionsModal.isOpen}
      onOpenChange={loadExerciseOptionsModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <span className="w-[24rem] truncate">
                {selectedExercise === undefined ? (
                  "Select Exercise"
                ) : (
                  <>
                    Stats To Load For{" "}
                    <span className="text-secondary">
                      {selectedExercise.name}
                    </span>
                  </>
                )}
              </span>
            </ModalHeader>
            <ModalBody className="py-0">
              {selectedExercise === undefined ? (
                <div className="h-[456px] flex flex-col gap-1.5">
                  <ExerciseModalList
                    handleClickExercise={handleClickExercise}
                    useExerciseList={useExerciseList}
                    useExerciseListFilters={useExerciseListFilters}
                    userSettings={userSettings}
                    setUserSettings={setUserSettings}
                    customHeightString="h-[456px]"
                    isInAnalyticsPage
                  />
                </div>
              ) : (
                <div className="h-[456px] flex flex-col gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <div className="relative">
                      <div className="flex items-end">
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-medium">
                            <span className="text-secondary text-lg">
                              {loadExerciseOptions.size}
                            </span>{" "}
                            Stat{loadExerciseOptions.size !== 1 && "s"} Selected
                          </span>
                          {filterCategories.size > 0 && (
                            <span className="text-secondary text-xs px-0.5">
                              (Showing {filteredLoadExerciseOptionsMap.size} out
                              of {loadExerciseOptionsMap.size} options)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="absolute right-0 -top-2">
                        <Dropdown closeOnSelect={false}>
                          <DropdownTrigger>
                            <Button
                              className="z-1"
                              variant="flat"
                              color={
                                filterCategories.size > 0
                                  ? "secondary"
                                  : "default"
                              }
                              size="sm"
                            >
                              Filter
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Filter Categories Dropdown Menu"
                            selectedKeys={filterCategories as Set<string>}
                            selectionMode="multiple"
                            onSelectionChange={
                              setFilterCategories as React.Dispatch<
                                React.SetStateAction<SharedSelection>
                              >
                            }
                          >
                            {Array.from(validLoadExerciseOptionsCategories).map(
                              (category) => (
                                <DropdownItem key={category}>
                                  {category}
                                </DropdownItem>
                              )
                            )}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                    {filterCategories.size > 0 && (
                      <div className="flex items-center gap-1 flex-wrap max-w-[25rem]">
                        {Array.from(filterCategories).map((category) => (
                          <Chip
                            key={category}
                            classNames={{ content: "max-w-[20rem] truncate" }}
                            radius="sm"
                            color="secondary"
                            variant="flat"
                            onClose={() => removeFilter(category)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="font-medium">{category}</span>
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                  <ScrollShadow className="px-0.5 pb-1">
                    <div className="columns-2">
                      {Array.from(filteredLoadExerciseOptionsMap).map(
                        ([key, value]) => (
                          <Checkbox
                            key={key}
                            className="hover:underline w-full min-w-full -mb-1"
                            color="primary"
                            isSelected={loadExerciseOptions.has(
                              key as ChartDataExerciseCategoryBase
                            )}
                            onValueChange={() =>
                              handleLoadExerciseOptionsChange(
                                key as ChartDataExerciseCategoryBase
                              )
                            }
                            isDisabled={disabledLoadExerciseOptions.has(
                              key as ChartDataExerciseCategoryBase
                            )}
                          >
                            {value}
                          </Checkbox>
                        )
                      )}
                    </div>
                  </ScrollShadow>
                  <div className="flex flex-col gap-1.5 drop-shadow-xl">
                    <div className="px-0.5 py-0.5 flex gap-12">
                      <Checkbox
                        className="hover:underline"
                        color="default"
                        isSelected={ignoreWarmups}
                        onValueChange={setIgnoreWarmups}
                      >
                        Ignore Warmups
                      </Checkbox>
                      <Checkbox
                        className="hover:underline"
                        color="default"
                        isSelected={ignoreMultisets}
                        onValueChange={setIgnoreMultisets}
                      >
                        Ignore Multisets
                      </Checkbox>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-[11.75rem]">
                        <Select
                          label="Chart Area Category"
                          classNames={{
                            trigger: "bg-amber-50 border-amber-200",
                          }}
                          size="sm"
                          variant="faded"
                          selectedKeys={
                            loadExerciseOptionsUnitCategoryPrimary !== undefined
                              ? [loadExerciseOptionsUnitCategoryPrimary]
                              : []
                          }
                          onChange={(e) =>
                            handleLoadExerciseOptionsUnitCategoryChange(e)
                          }
                          isDisabled={
                            loadExerciseOptionsUnitCategoriesPrimary.size < 2
                          }
                          disallowEmptySelection
                        >
                          {Array.from(
                            loadExerciseOptionsUnitCategoriesPrimary
                          ).map((category) => (
                            <SelectItem key={category}>{category}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className="w-[11.75rem]">
                        <Select
                          label="Chart Line Category"
                          size="sm"
                          variant="faded"
                          selectedKeys={
                            loadExerciseOptionsUnitCategorySecondary !==
                            undefined
                              ? [loadExerciseOptionsUnitCategorySecondary]
                              : []
                          }
                          onChange={(e) =>
                            setLoadExerciseOptionsUnitCategorySecondary(
                              e.target.value as ChartDataUnitCategory
                            )
                          }
                          isDisabled={
                            loadExerciseOptionsUnitCategoriesSecondary.length <
                            2
                          }
                          disallowEmptySelection
                        >
                          {loadExerciseOptionsUnitCategoriesSecondary.map(
                            (category) => (
                              <SelectItem key={category}>{category}</SelectItem>
                            )
                          )}
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {selectedExercise !== undefined &&
                  loadExerciseOptions.size > 0 && (
                    <Button
                      className="z-1"
                      variant="flat"
                      color="secondary"
                      onPress={handleClearAllButton}
                    >
                      Clear All
                    </Button>
                  )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={
                    selectedExercise === undefined
                      ? onClose
                      : () => setSelectedExercise(undefined)
                  }
                >
                  {selectedExercise === undefined ? "Close" : "Back"}
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    selectedExercise === undefined ||
                    loadExerciseOptions.size === 0 ||
                    loadExerciseOptionsUnitCategoryPrimary === undefined
                  }
                  onPress={handleLoadButton}
                >
                  Load
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
