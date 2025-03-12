import { useMemo } from "react";
import { ChartDataCategory, ChartDataUnitCategory } from "../typings";
import { ChartConfig } from "../components/ui/chart";

export const useDefaultChartMapsAndConfig = () => {
  const defaultChartMapsAndConfig = useMemo(() => {
    const defaultChartDataUnitMap = new Map<ChartDataCategory, string>([
      ["calories", " kcal"],
      ["fat", " g"],
      ["carbs", " g"],
      ["protein", " g"],
      ["body_fat_percentage", " %"],
    ]);

    const defaultChartDataUnitCategoryMap = new Map<
      ChartDataCategory,
      ChartDataUnitCategory
    >([
      ["calories", "Calories"],
      ["fat", "Macros"],
      ["carbs", "Macros"],
      ["protein", "Macros"],
      ["body_weight", "Weight"],
      ["body_fat_percentage", "Body Fat %"],
      ["weight_min", "Weight"],
      ["weight_max", "Weight"],
      ["weight_avg", "Weight"],
      ["weight_volume", "Weight"],
      ["num_sets", "Number Of Sets"],
      ["num_reps_min", "Number Of Reps"],
      ["num_reps_max", "Number Of Reps"],
      ["num_reps_avg", "Number Of Reps"],
      ["num_reps_total", "Number Of Reps"],
      ["num_reps_and_partial_reps_min", "Number Of Reps"],
      ["num_reps_and_partial_reps_max", "Number Of Reps"],
      ["num_reps_and_partial_reps_avg", "Number Of Reps"],
      ["num_reps_and_partial_reps_total", "Number Of Reps"],
      ["num_partial_reps_min", "Number Of Reps"],
      ["num_partial_reps_max", "Number Of Reps"],
      ["num_partial_reps_avg", "Number Of Reps"],
      ["num_partial_reps_total", "Number Of Reps"],
      ["set_body_weight", "Weight"],
      ["rir_min", "RIR"],
      ["rir_max", "RIR"],
      ["rir_avg", "RIR"],
      ["rpe_min", "RPE"],
      ["rpe_max", "RPE"],
      ["rpe_avg", "RPE"],
      ["distance_min", "Distance"],
      ["distance_max", "Distance"],
      ["distance_avg", "Distance"],
      ["distance_total", "Distance"],
      ["time_min", "Time"],
      ["time_max", "Time"],
      ["time_avg", "Time"],
      ["time_total", "Time"],
      ["pace_min", "Pace"],
      ["pace_max", "Pace"],
      ["pace_avg", "Pace"],
      ["resistance_level_min", "Resistance Level"],
      ["resistance_level_max", "Resistance Level"],
      ["resistance_level_avg", "Resistance Level"],
    ]);

    const defaultChartConfig: ChartConfig = {
      default: { label: "Unknown" },
      calories: {
        label: "Calories",
      },
      fat: { label: "Fat" },
      carbs: { label: "Carbs" },
      protein: { label: "Protein" },
      body_weight: {
        label: "Body Weight",
      },
      body_fat_percentage: {
        label: "Body Fat %",
      },
    };

    return {
      defaultChartDataUnitMap,
      defaultChartDataUnitCategoryMap,
      defaultChartConfig,
    };
  }, []);

  return defaultChartMapsAndConfig;
};
