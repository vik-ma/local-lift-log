import { FormatDateToShortString } from "..";
import { ChartDataItem } from "../../typings";

export const FillInMissingChartDates = (
  loadedChartData: ChartDataItem[],
  locale: string
): ChartDataItem[] => {
  if (loadedChartData.length === 0) return [];

  const filledInChartData: ChartDataItem[] = [];

  const chartDataDateMap = new Map(
    loadedChartData.map((item) => [item.date, item])
  );

  const currentDate = new Date(loadedChartData[0].date);
  const endDate = new Date(loadedChartData[loadedChartData.length - 1].date);

  while (currentDate <= endDate) {
    const dateString = FormatDateToShortString(currentDate, locale);

    if (chartDataDateMap.has(dateString)) {
      filledInChartData.push(chartDataDateMap.get(dateString)!);
    } else {
      // Fill in empty ChartDataItems for missing dates
      const chartDataItem: ChartDataItem = {
        date: dateString,
      };

      filledInChartData.push(chartDataItem);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filledInChartData;
};
