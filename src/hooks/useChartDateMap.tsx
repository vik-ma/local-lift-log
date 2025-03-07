import { useMemo } from "react";

export const useChartDateMap = () => {
  const dateMap = useMemo(() => {
    const dateMap = new Map<string, Date>();

    const date30DaysAgo = new Date();
    date30DaysAgo.setHours(-720, 0, 0, 0);
    const date90DaysAgo = new Date();
    date90DaysAgo.setHours(-2160, 0, 0, 0);
    const date180DaysAgo = new Date();
    date180DaysAgo.setHours(-4320, 0, 0, 0);
    const date365DaysAgo = new Date();
    date365DaysAgo.setHours(-8760, 0, 0, 0);
    const date730DaysAgo = new Date();
    date730DaysAgo.setHours(-17520, 0, 0, 0);

    dateMap.set("Last 30 Days", date30DaysAgo);
    dateMap.set("Last 90 Days", date90DaysAgo);
    dateMap.set("Last 180 Days", date180DaysAgo);
    dateMap.set("Last Year", date365DaysAgo);
    dateMap.set("Last Two Years", date730DaysAgo);

    return dateMap;
  }, []);

  return dateMap;
};
