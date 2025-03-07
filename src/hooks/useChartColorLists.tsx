import { useMemo } from "react";

export const useChartColorLists = () => {
  const chartColorLists = useMemo(() => {
    const chartLineColorList = [
      "#6b80ed", // Blue
      "#e6475a", // Red
      "#525252", // Dark Grey
      "#07e0e7", // Cyan
      "#8739cf", // Purple
      "#53a804", // Green
      "#9e5a01", // Brown
    ];

    const chartAreaColorList = [
      "#edc345", // Yellow
      "#f57489", // Light Red
      "#7bdf83", // Light Green
      "#84a0eb", // Light Blue
      "#f5af79", // Light Orange
      "#918c8c", // Light Grey
      "#d79de9", // Light Purple
    ];

    const referenceAreaColorList = [
      "#2862cc", // Blue
      "#26be21", // Green
      "#ff3ba7", // Pink
      "#c93814", // Brown/Red
      "#1ab2f8", // Light Blue
    ];

    return { chartLineColorList, chartAreaColorList, referenceAreaColorList };
  }, []);

  return chartColorLists;
};
