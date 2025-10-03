import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Calendar,
  ScrollShadow,
} from "@heroui/react";
import {
  Routine,
  UseCalendarModalReturnType,
  UserSettings,
} from "../../typings";
import {
  CALENDAR_COLOR_LIST,
  EXERCISE_GROUP_DICTIONARY,
  MODAL_BODY_HEIGHT,
} from "../../constants";
import { useEffect, useMemo } from "react";
import { I18nProvider } from "@react-aria/i18n";
import {
  CreateCalendarDotDiv,
  FormatISODateStringToCalendarAriaLabelString,
  UpdateUserSetting,
} from "../../helpers";
import { CalendarDateMarkingsDropdown } from "..";

type CalendarModalProps = {
  useCalendarModal: UseCalendarModalReturnType;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  activeRoutine: Routine | undefined;
};

const NO_WORKOUTS_DIV = (
  <div className="w-[9.1rem] pt-0.5 text-sm font-medium text-center text-stone-400">
    No Workouts
  </div>
);

export const CalendarModal = ({
  useCalendarModal,
  userSettings,
  setUserSettings,
  activeRoutine,
}: CalendarModalProps) => {
  const {
    calendarModal,
    operatingCalendarMonth,
    isCalendarWorkoutListLoaded,
    handleCalendarMonthChange,
    currentDateString,
    calendarDateMarking,
    setCalendarDateMarking,
    operatingYearMonth,
    currentMonth,
    disableActiveRoutineOption,
  } = useCalendarModal;

  const calendarWidth =
    calendarDateMarking === "workouts" || calendarDateMarking === "none"
      ? 290
      : 250;

  const handleCalendarDateMarkingChange = async (value: string) => {
    setCalendarDateMarking(value);

    await UpdateUserSetting(
      "calendar_date_marking",
      value,
      userSettings,
      setUserSettings
    );
  };

  const renderCalendarDateMarkings = () => {
    if (operatingYearMonth.current === currentMonth.current) {
      const todayCell = document.querySelector(
        `[aria-label="Today, ${currentDateString.current}"]`
      ) as HTMLElement;

      if (todayCell) {
        todayCell.style.border = "2px solid #f0c63bCC";
      }
    }

    const dateWrapperCellMap = new Map<string, HTMLDivElement>();

    for (const workout of operatingCalendarMonth.workoutList) {
      const date = FormatISODateStringToCalendarAriaLabelString(
        workout.date,
        userSettings.locale
      );

      const wrapperIdString = `${date}-marking-wrapper`;

      const existingWrapper = document.getElementById(wrapperIdString);

      if (existingWrapper && !dateWrapperCellMap.has(date)) {
        existingWrapper.remove();
      }

      if (calendarDateMarking === "none") continue;

      const querySelectorString =
        date === currentDateString.current
          ? `[aria-label="Today, ${date}"]`
          : `[aria-label="${date}"]`;

      const dateCell = document.querySelector(
        querySelectorString
      ) as HTMLElement;

      if (dateCell === null) continue;

      const parentCell = dateCell.parentElement;

      if (parentCell === null) continue;

      let wrapper = document.createElement("div");

      if (dateWrapperCellMap.has(date)) {
        wrapper = dateWrapperCellMap.get(date)!;

        // Do not add more than 16 dots per date
        if (wrapper.children.length >= 16) continue;
      } else {
        wrapper.id = wrapperIdString;
        wrapper.style.position = "absolute";
        wrapper.style.width = "100%";
        wrapper.style.display = "flex";
        wrapper.style.flexWrap = "wrap-reverse";
        wrapper.style.justifyContent = "center";
        wrapper.style.gap = "1px";
        wrapper.style.bottom = "4px";
        wrapper.style.pointerEvents = "none";

        parentCell.style.position = "relative";

        parentCell.appendChild(wrapper);

        dateWrapperCellMap.set(date, wrapper);
      }

      if (calendarDateMarking === "exercise-groups") {
        const monthExerciseGroupList = Array.from(
          operatingCalendarMonth.exerciseGroupSet
        );

        for (const exerciseGroup of workout.exerciseGroupSet) {
          // Do not add more than 16 dots per date
          if (wrapper.children.length >= 16) continue;

          const dotColorIndex = monthExerciseGroupList.findIndex(
            (obj) => obj === exerciseGroup
          );

          const dotColor = CALENDAR_COLOR_LIST[dotColorIndex];

          const dot = CreateCalendarDotDiv(dotColor);

          wrapper.appendChild(dot);
        }
      } else {
        const dotColorIndex =
          calendarDateMarking === "workouts"
            ? wrapper.children.length
            : operatingCalendarMonth.workoutTemplateMap.get(
                workout.workout_template_id
              )!.index;

        const dotColor =
          CALENDAR_COLOR_LIST[dotColorIndex % CALENDAR_COLOR_LIST.length];

        const dot = CreateCalendarDotDiv(dotColor);

        wrapper.appendChild(dot);
      }
    }
  };

  const workoutTemplateList = useMemo(() => {
    if (operatingCalendarMonth.workoutList.length === 0) return NO_WORKOUTS_DIV;

    return (
      <div className="flex flex-col max-h-[274px]">
        <h4 className="font-medium text-sm">Workout Templates</h4>
        <ScrollShadow className="w-[9.125rem]">
          {Array.from(operatingCalendarMonth.workoutTemplateMap).map(
            ([id, item]) => {
              const textColor = CALENDAR_COLOR_LIST[
                item.index % CALENDAR_COLOR_LIST.length
              ].substring(0, 7);

              return (
                <div
                  key={id}
                  className="text-xs truncate"
                  style={{ color: textColor }}
                >
                  {item.name}
                </div>
              );
            }
          )}
        </ScrollShadow>
      </div>
    );
  }, [operatingCalendarMonth]);

  const exerciseGroupList = useMemo(() => {
    if (operatingCalendarMonth.workoutList.length === 0) return NO_WORKOUTS_DIV;

    return (
      <div className="flex flex-col max-h-[274px]">
        <h4 className="font-medium text-sm">Exercise Groups</h4>
        <ScrollShadow className="w-[9.125rem]">
          {Array.from(operatingCalendarMonth.exerciseGroupSet).map(
            (exerciseGroup, index) => {
              const textColor = CALENDAR_COLOR_LIST[index].substring(0, 7);

              return (
                <div
                  key={exerciseGroup}
                  className="text-xs truncate"
                  style={{ color: textColor }}
                >
                  {EXERCISE_GROUP_DICTIONARY.get(exerciseGroup)}
                </div>
              );
            }
          )}
        </ScrollShadow>
      </div>
    );
  }, [operatingCalendarMonth]);

  useEffect(() => {
    if (!calendarModal.isOpen || !isCalendarWorkoutListLoaded.current) return;

    renderCalendarDateMarkings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarModal.isOpen, operatingCalendarMonth, calendarDateMarking]);

  return (
    <Modal
      isOpen={calendarModal.isOpen}
      onOpenChange={calendarModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-baseline gap-1">
              <span>Calendar</span>
              <span className="font-medium text-secondary text-sm">
                ({currentDateString.current})
              </span>
            </ModalHeader>
            <ModalBody className="py-0">
              <div
                className={`${MODAL_BODY_HEIGHT} flex flex-col items-center gap-2`}
              >
                <CalendarDateMarkingsDropdown
                  value={calendarDateMarking}
                  setValue={setCalendarDateMarking}
                  targetType="calendar-modal"
                  handleChangeInModal={handleCalendarDateMarkingChange}
                  isInCalendarModal
                  disableActiveRoutine={disableActiveRoutineOption.current}
                />
                <div className="max-h-[310px] flex gap-2.5">
                  <I18nProvider locale={userSettings.locale}>
                    <Calendar
                      calendarWidth={calendarWidth}
                      onFocusChange={(value) =>
                        handleCalendarMonthChange(value)
                      }
                    />
                  </I18nProvider>
                  {calendarDateMarking === "workout-templates"
                    ? workoutTemplateList
                    : calendarDateMarking === "exercise-groups"
                    ? exerciseGroupList
                    : null}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
