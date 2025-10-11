import { UseCalendarModalReturnType } from "../typings";

type CalendarModalDateWorkoutTitleProps = {
  useCalendarModal: UseCalendarModalReturnType;
  index: number;
};

export const CalendarModalDateWorkoutTitle = ({
  useCalendarModal,
  index,
}: CalendarModalDateWorkoutTitleProps) => {
  const { operatingCalendarModalDate } = useCalendarModal;

  if (
    operatingCalendarModalDate === undefined ||
    operatingCalendarModalDate.workoutsWithGroupedSetList.length < 1
  )
    return null;

  return <h4 className="font-medium leading-snug">Workout {index + 1}</h4>;
};
