import { useMemo } from "react";
import { ChartReferenceAreaItem } from "../typings";

export const useChartTimePeriodIdSets = (
  referenceAreas: ChartReferenceAreaItem[],
  shownReferenceAreas: ChartReferenceAreaItem[]
) => {
  const timePeriodIdSet = useMemo(
    () =>
      new Set<string>(
        referenceAreas.map((area) => area.timePeriodId.toString())
      ),
    [referenceAreas]
  );

  const shownTimePeriodIdSet = useMemo(
    () =>
      new Set<string>(
        shownReferenceAreas.map((area) => area.timePeriodId.toString())
      ),
    [shownReferenceAreas]
  );

  return { timePeriodIdSet, shownTimePeriodIdSet };
};
