import {
  ChartDataCategory,
  ChartDataCategoryNoUndefined,
  ChartDataItem,
} from "../../typings";

export const UpdateChartDataAndFilteredHighestCategoryValues = (
  updatedChartData: ChartDataItem[],
  minDate: Date | null,
  maxDate: Date | null,
  chartData: ChartDataItem[],
  setChartData: React.Dispatch<React.SetStateAction<ChartDataItem[]>>,
  setFilteredChartData: React.Dispatch<React.SetStateAction<ChartDataItem[]>>,
  highestCategoryValues: React.RefObject<Map<ChartDataCategory, number>>,
  filteredHighestCategoryValues: React.RefObject<Map<ChartDataCategory, number>>
) => {
  setChartData(updatedChartData);

  if (!minDate && !maxDate) {
    setFilteredChartData(updatedChartData);

    filteredHighestCategoryValues.current = highestCategoryValues.current;
  } else {
    const updatedFilteredChartData: ChartDataItem[] = [];
    const updatedFilteredHighestCategoryValues = new Map<
      ChartDataCategory,
      number
    >();

    for (const entry of chartData) {
      if (minDate && new Date(entry.date) < minDate) continue;
      if (maxDate && new Date(entry.date) > maxDate) continue;

      updatedFilteredChartData.push(entry);

      Object.keys(entry).forEach((key) => {
        if (key !== "date") {
          const category = key as ChartDataCategoryNoUndefined;
          const value = entry[category] ?? 0;

          if (
            !updatedFilteredHighestCategoryValues.has(category) ||
            value > updatedFilteredHighestCategoryValues.get(category)!
          ) {
            updatedFilteredHighestCategoryValues.set(category, value);
          }
        }
      });
    }

    setFilteredChartData(updatedFilteredChartData);

    filteredHighestCategoryValues.current =
      updatedFilteredHighestCategoryValues;
  }
};
