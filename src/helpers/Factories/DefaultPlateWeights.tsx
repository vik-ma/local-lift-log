type PlateWeights = {
  metric: number[];
  imperial: number[];
};

export const DefaultPlateWeights = () => {
  const DEFAULT_PLATE_WEIGHTS: PlateWeights = {
    metric: [1.25, 2.5, 5, 10, 15, 20],
    imperial: [2.5, 5, 10, 25, 35, 45],
  };

  Object.freeze(DEFAULT_PLATE_WEIGHTS);

  return DEFAULT_PLATE_WEIGHTS;
};
