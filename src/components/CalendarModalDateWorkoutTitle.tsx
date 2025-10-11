import { CALENDAR_COLOR_LIST } from "../constants";
import { GetCalendarDateMarkingColorIndex } from "../helpers";
import { UseCalendarModalReturnType } from "../typings";

type CalendarModalDateWorkoutTitleProps = {
  useCalendarModal: UseCalendarModalReturnType;
  workoutIndex: number;
  ignoreWorkout: boolean;
};

export const CalendarModalDateWorkoutTitle = ({
  useCalendarModal,
  workoutIndex,
  ignoreWorkout,
}: CalendarModalDateWorkoutTitleProps) => {
  const {
    operatingCalendarModalDate,
    calendarDateMarking,
    operatingCalendarMonth,
  } = useCalendarModal;

  if (
    operatingCalendarModalDate === undefined ||
    operatingCalendarModalDate.workoutsWithGroupedSetList.length < 1
  )
    return null;

  const textColorIndex = GetCalendarDateMarkingColorIndex(
    calendarDateMarking,
    operatingCalendarModalDate.workoutsWithGroupedSetList[workoutIndex].workout
      .workout_template_id,
    operatingCalendarMonth,
    workoutIndex
  );

  const textColor = ignoreWorkout
    ? "#a8a29e" // text-stone-400
    : CALENDAR_COLOR_LIST[textColorIndex % CALENDAR_COLOR_LIST.length];

  return (
    <h4
      className="font-medium leading-snug"
      style={{
        color:
          calendarDateMarking === "exercise-groups" ? undefined : textColor,
      }}
    >
      Workout {workoutIndex + 1}
      {ignoreWorkout && (
        <span className="text-xs font-normal"> (Not In Active Routine)</span>
      )}
    </h4>
  );
};
