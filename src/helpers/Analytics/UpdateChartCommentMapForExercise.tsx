import {
  ChartComment,
  ChartDataExerciseCategory,
  ChartDataExerciseCategoryBase,
  LoadedChartType,
} from "../../typings";

type UpdateChartCommentMapForExerciseReturnType = {
  areCommentsAlreadyLoaded: boolean;
  updatedChartCommentMap: Map<string, ChartComment[]>;
};

export const UpdateChartCommentMapForExercise = (
  loadExerciseOptions: Set<ChartDataExerciseCategoryBase>,
  exerciseId: number,
  loadedCharts: Set<LoadedChartType>,
  chartCommentMap: Map<string, ChartComment[]>,
  loadExerciseOptionsMap: Map<ChartDataExerciseCategoryBase, string>
): UpdateChartCommentMapForExerciseReturnType => {
  let areCommentsAlreadyLoaded = false;
  const updatedChartCommentMap = new Map(chartCommentMap);
  let dataKey = "";

  for (const option of loadExerciseOptionsMap.keys()) {
    const chartName: ChartDataExerciseCategory = `${option}_${exerciseId}`;

    if (loadedCharts.has(chartName)) {
      areCommentsAlreadyLoaded = true;
      dataKey = chartName;
      break;
    }
  }

  return { areCommentsAlreadyLoaded, updatedChartCommentMap };
};
