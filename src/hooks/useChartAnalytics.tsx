import { useDisclosure } from "@heroui/react";
import { useState } from "react";
import {
  ChartDataCategory,
  ChartDataExerciseCategoryBase,
  ChartDataUnitCategory,
} from "../typings";
import { useLoadExerciseOptionsMap } from ".";
import { ValidLoadExerciseOptionsCategories } from "../helpers";

export const useChartAnalytics = () => {
  const [chartDataAreas, setChartDataAreas] = useState<ChartDataCategory[]>([]);
  const [secondaryDataUnitCategory, setSecondaryDataUnitCategory] =
    useState<ChartDataUnitCategory>();

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

  const loadExerciseOptionsModal = useDisclosure();

  const loadExerciseOptionsMap = useLoadExerciseOptionsMap();

  const validLoadExerciseOptionsCategories =
    ValidLoadExerciseOptionsCategories();

  return {
    loadExerciseOptionsModal,
    loadExerciseOptions,
    setLoadExerciseOptions,
    disabledLoadExerciseOptions,
    setDisabledLoadExerciseOptions,
    loadExerciseOptionsUnitCategoryPrimary,
    setLoadExerciseOptionsUnitCategoryPrimary,
    loadExerciseOptionsUnitCategorySecondary,
    setLoadExerciseOptionsUnitCategorySecondary,
    loadExerciseOptionsUnitCategoriesPrimary,
    setLoadExerciseOptionsUnitCategoriesPrimary,
    loadExerciseOptionsUnitCategoriesSecondary,
    setLoadExerciseOptionsUnitCategoriesSecondary,
    chartDataAreas,
    setChartDataAreas,
    loadExerciseOptionsMap,
    secondaryDataUnitCategory,
    setSecondaryDataUnitCategory,
    validLoadExerciseOptionsCategories,
  };
};
