import { useMemo } from "react";
import { ChartReferenceAreaItem } from "../typings";

type UseChartTimePeriodIdSetsProps = {
  referenceAreas: ChartReferenceAreaItem[];
  shownReferenceAreas: ChartReferenceAreaItem[];
};

export const useChartTimePeriodIdSets = ({
  referenceAreas,
  shownReferenceAreas,
}: UseChartTimePeriodIdSetsProps) => {
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
