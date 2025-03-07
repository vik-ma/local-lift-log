import {
  ChartComment,
  ChartDataCategory,
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
  let existingDataKey = "";

  for (const option of loadExerciseOptionsMap.keys()) {
    const chartName: ChartDataExerciseCategory = `${option}_${exerciseId}`;

    if (loadedCharts.has(chartName)) {
      areCommentsAlreadyLoaded = true;
      existingDataKey = chartName;
      break;
    }
  }

  if (areCommentsAlreadyLoaded) {
    const newDataKeys: Set<ChartDataExerciseCategory> = new Set(
      [...loadExerciseOptions].map(
        (option) => `${option}_${exerciseId}` as ChartDataExerciseCategory
      )
    );

    for (const [, chartCommentList] of updatedChartCommentMap) {
      for (const chartComment of chartCommentList) {
        if (chartComment.dataKeys.has(existingDataKey as ChartDataCategory)) {
          const updatedDataKeys = new Set([
            ...chartComment.dataKeys,
            ...newDataKeys,
          ]);

          chartComment.dataKeys = updatedDataKeys;
        }
      }
    }
  }

  return { areCommentsAlreadyLoaded, updatedChartCommentMap };
};
