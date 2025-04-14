import { FormatDateToShortString } from "..";
import { ChartDataItem } from "../../typings";

export const MergeChartData = (
  list1: ChartDataItem[],
  list2: ChartDataItem[],
  locale: string,
  setChartStartDate: React.Dispatch<React.SetStateAction<Date | null>>,
  setChartEndDate: React.Dispatch<React.SetStateAction<Date | null>>
) => {
  const chartDataDateMap = new Map<string, ChartDataItem>();

  if (list1.length > 0 && list2.length > 0) {
    const minDate1 = new Date(list1[0].date);
    const maxDate1 = new Date(list1[list1.length - 1].date);
    maxDate1.setDate(maxDate1.getDate() + 1);
    const minDate2 = new Date(list2[0].date);
    const maxDate2 = new Date(list2[list2.length - 1].date);
    maxDate2.setDate(maxDate2.getDate() + 1);

    // Check if there is a gap of dates between the end of one list and the start of the other
    const isGapAndList1ComesFirst = maxDate1.getTime() < minDate2.getTime();
    const isGapAndList2ComesFirst = maxDate2.getTime() < minDate1.getTime();

    if (isGapAndList1ComesFirst || isGapAndList2ComesFirst) {
      const currentDate = isGapAndList1ComesFirst ? maxDate1 : maxDate2;
      const endDate = isGapAndList1ComesFirst ? minDate2 : minDate1;

      while (currentDate < endDate) {
        const dateString = FormatDateToShortString(currentDate, locale);

        const chartDataItem: ChartDataItem = { date: dateString };

        // Fill in the gaps in list that is chronologically first
        if (isGapAndList1ComesFirst) {
          list1.push(chartDataItem);
        } else {
          list2.push(chartDataItem);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }

  // Add all props from both lists to ChartDataItem of same date
  const mergeIntoMap = (list: ChartDataItem[]) => {
    for (const item of list) {
      if (!chartDataDateMap.has(item.date)) {
        chartDataDateMap.set(item.date, { ...item });
      } else {
        chartDataDateMap.set(item.date, {
          ...chartDataDateMap.get(item.date),
          ...item,
        });
      }
    }
  };

  mergeIntoMap(list1);
  mergeIntoMap(list2);

  // Create chartData array with dates sorted from oldest to newest
  const mergedChartData = Array.from(chartDataDateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  setChartStartDate(new Date(mergedChartData[0].date));
  setChartEndDate(new Date(mergedChartData[mergedChartData.length - 1].date));

  return mergedChartData;
};
