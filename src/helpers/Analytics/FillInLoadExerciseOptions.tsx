import { CreateLoadExerciseOptionsList } from "..";
import {
  ChartDataCategory,
  ChartDataCategoryNoUndefined,
  ChartDataExerciseCategoryBase,
  ChartDataUnitCategory,
  ChartDataUnitCategoryNoUndefined,
  Exercise,
} from "../../typings";

export const FillInLoadExerciseOptions = (
  loadExerciseOptionsString: string,
  loadExerciseOptionsCategoriesString: string,
  selectedExercise: Exercise,
  isInAnalytics: boolean,
  loadedCharts: Set<ChartDataCategoryNoUndefined>,
  validLoadExerciseOptionsCategories: Set<ChartDataUnitCategoryNoUndefined>,
  chartDataUnitCategoryMap: Map<ChartDataCategory, ChartDataUnitCategory>,
  chartDataAreas: ChartDataCategory[],
  secondaryDataUnitCategory: ChartDataUnitCategory,
  setLoadExerciseOptions: React.Dispatch<
    React.SetStateAction<Set<ChartDataExerciseCategoryBase>>
  >,
  setLoadExerciseOptionsUnitCategoryPrimary: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory>
  >,
  setLoadExerciseOptionsUnitCategorySecondary: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory>
  >,
  setLoadExerciseOptionsUnitCategoriesPrimary: React.Dispatch<
    React.SetStateAction<Set<ChartDataUnitCategory>>
  >,
  setLoadExerciseOptionsUnitCategoriesSecondary: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory[]>
  >,
  setDisabledLoadExerciseOptions: React.Dispatch<
    React.SetStateAction<Set<ChartDataExerciseCategoryBase>>
  >
) => {
  const disabledKeys = new Set<ChartDataExerciseCategoryBase>();

  // Disable any options that have already been loaded for Exercise
  if (isInAnalytics) {
    // TODO: FIX FOR EXERCISEDETAILS

    const id = selectedExercise.id;

    // Check if a ChartDataExerciseCategoryBase value exists for selectedExercise id
    for (const chart of loadedCharts) {
      const lastIndex = chart.lastIndexOf("_");

      if (lastIndex === -1) continue;

      const chartName = chart.substring(0, lastIndex);
      const chartId = chart.substring(lastIndex + 1);

      if (chartId === id.toString() && chartName !== "measurement") {
        disabledKeys.add(chartName as ChartDataExerciseCategoryBase);
      }
    }
  }

  setDisabledLoadExerciseOptions(disabledKeys);

  // Create list from default string, without any disabled options
  const loadExerciseOptionsList = CreateLoadExerciseOptionsList(
    loadExerciseOptionsString,
    selectedExercise.exercise_group_set_string_primary
  ).filter((option) => !disabledKeys.has(option));

  setLoadExerciseOptions(new Set(loadExerciseOptionsList));

  const unitCategoriesPrimary: ChartDataUnitCategory[] = [];

  unitCategoriesPrimary.push(
    ...loadExerciseOptionsList.map((option) =>
      chartDataUnitCategoryMap.get(option)
    )
  );

  const savedCategories = loadExerciseOptionsCategoriesString.split(
    ","
  ) as ChartDataUnitCategoryNoUndefined[];

  let unitCategoryPrimary: ChartDataUnitCategory = undefined;

  const chartAreaUnitCategory = chartDataUnitCategoryMap.get(chartDataAreas[0]);

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
