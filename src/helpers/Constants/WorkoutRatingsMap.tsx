type WorkoutRatingMap = {
  [key: string]: {
    label: string;
    num: number;
  };
};

export const WorkoutRatingsMap = () => {
  const WORKOUT_RATINGS_MAP: WorkoutRatingMap = {
    general: {
      label: "General",
      num: 1,
    },
    energy: {
      label: "Energy Level",
      num: 2,
    },
    injury: {
      label: "Injury Level",
      num: 3,
    },
    sleep: {
      label: "Sleep Quality",
      num: 4,
    },
    calories: {
      label: "Caloric Intake",
      num: 5,
    },
    fasting: {
      label: "Time Fasted",
      num: 6,
    },
    time: {
      label: "Time Available",
      num: 7,
    },
    stress: {
      label: "Stress Level",
      num: 8,
    },
  };

  Object.freeze(WORKOUT_RATINGS_MAP);

  return WORKOUT_RATINGS_MAP;
};
