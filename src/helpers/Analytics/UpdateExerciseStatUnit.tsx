import {
    ChartDataCategory,
  ChartDataExerciseCategory,
  ChartDataUnitCategory,
} from "../../typings";

export const UpdateExerciseStatUnit = (
  chartName: ChartDataExerciseCategory,
  optionCategory: ChartDataUnitCategory,
  weightUnit: string,
  distanceUnit: string,
  speedUnit: string,
  paceUnit: string,
  chartDataUnitMap: React.RefObject<Map<ChartDataCategory, string>>
) => {
  let unit = "";

  switch (optionCategory) {
    case "Weight":
      unit = ` ${weightUnit}`;
      break;
    case "Distance":
      unit = ` ${distanceUnit}`;
      break;
    case "Time":
      unit = " min";
      break;
    case "Speed":
      unit = ` ${speedUnit}`;
      break;
    case "Pace":
      unit = ` ${paceUnit}`;
      break;
    case "Number Of Sets":
      unit = " sets";
      break;
    case "Number Of Reps":
      unit = " reps";
      break;
    case "RIR":
      unit = " RIR";
      break;
    case "RPE":
      unit = " RPE";
      break;
    case "Resistance Level":
      unit = " RL";
      break;
    default:
      break;
  }

  chartDataUnitMap.current.set(chartName, unit);
};
