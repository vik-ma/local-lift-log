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
  CalendarWorkoutTemplateMap,
  Routine,
  SimpleRoutineScheduleItem,
  UseCalendarModalReturnType,
  UserSettings,
} from "../../typings";
import {
  CALENDAR_COLOR_LIST,
  EXERCISE_GROUP_DICTIONARY,
  MODAL_BODY_HEIGHT,
} from "../../constants";
import { useEffect, useMemo, useRef } from "react";
import { I18nProvider } from "@react-aria/i18n";
import {
  CreateCalendarDateWrapperDiv,
  CreateCalendarDotDiv,
  CreateDateRoutineScheduleListMap,
  FormatISODateStringToCalendarAriaLabelString,
  GetCalendarDateQuerySelectorString,
  IsRoutineCustomStartDateInvalid,
  UpdateUserSetting,
} from "../../helpers";
import { CalendarDateMarkingsDropdown, CalendarModalLegend } from "..";

type CalendarModalProps = {
  useCalendarModal: UseCalendarModalReturnType;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  activeRoutine: Routine | undefined;
};

const CALENDAR_DOT_ALPHA_CODE = "CC"; // 80%
const CALENDAR_DOT_FUTURE_ALPHA_CODE = "66"; // 40%

const CALENDAR_GRID_DATA_SLOT_VALUE = '[data-slot="grid-body"]';

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
    workoutsForCurrentDate,
    handleDateClick,
    operatingCalendarModalDate,
  } = useCalendarModal;

  const calendarWidth =
    calendarDateMarking === "workouts" || calendarDateMarking === "none"
      ? 290
      : 250;

  const futureWorkoutDateWrapperCellList = useRef<HTMLDivElement[]>([]);

  const clearFutureWorkoutDateWrapperCellMap = () => {
    if (futureWorkoutDateWrapperCellList.current.length === 0) return;

    for (const cell of futureWorkoutDateWrapperCellList.current) {
      cell.remove();
    }

    futureWorkoutDateWrapperCellList.current = [];
  };

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
    const calendarGrid = document.querySelector(CALENDAR_GRID_DATA_SLOT_VALUE);

    if (calendarGrid === null) return;

    if (operatingYearMonth.current === currentMonth.current) {
      const todayCell = calendarGrid.querySelector(
        `[aria-label^="Today"]`
      ) as HTMLElement;

      if (todayCell) {
        todayCell.style.border = "2px solid #f0c63bCC";
      }
    }

    if (operatingYearMonth.current >= currentMonth.current) {
      clearFutureWorkoutDateWrapperCellMap();
    }

    const dateWrapperCellMap = new Map<string, HTMLDivElement>();

    for (const workout of operatingCalendarMonth.workoutList) {
      const date = FormatISODateStringToCalendarAriaLabelString(
        workout.date,
        userSettings.locale
      );

      const wrapperIdString = `${date}-marking-wrapper`;

      const existingWrapper = calendarGrid.querySelector(
        `[id="${wrapperIdString}"]`
      );

      if (existingWrapper && !dateWrapperCellMap.has(date)) {
        existingWrapper.remove();
      }

      if (
        calendarDateMarking === "none" ||
        (calendarDateMarking === "active-routine" &&
          workout.routine_id !== activeRoutine?.id)
      )
        continue;

      const querySelectorString = GetCalendarDateQuerySelectorString(date);

      const dateCell = calendarGrid.querySelector(
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
        CreateCalendarDateWrapperDiv(
          date,
          wrapperIdString,
          wrapper,
          parentCell,
          dateWrapperCellMap
        );
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

          const dotColor =
            CALENDAR_COLOR_LIST[dotColorIndex] + CALENDAR_DOT_ALPHA_CODE;

          const dot = CreateCalendarDotDiv(dotColor);

          wrapper.appendChild(dot);
        }
      } else {
        const dotColorIndex =
          calendarDateMarking === "workout-templates"
            ? operatingCalendarMonth.workoutTemplateMap.get(
                workout.workout_template_id
              )!.index
            : calendarDateMarking === "active-routine"
            ? operatingCalendarMonth.routineWorkoutTemplateMap.get(
                workout.workout_template_id
              )!.index
            : wrapper.children.length;

        const dotColor =
          CALENDAR_COLOR_LIST[dotColorIndex % CALENDAR_COLOR_LIST.length] +
          CALENDAR_DOT_ALPHA_CODE;

        const dot = CreateCalendarDotDiv(dotColor);

        wrapper.appendChild(dot);
      }
    }

    if (calendarDateMarking === "active-routine") {
      renderFutureCalendarDateMarkingsForActiveRoutine(calendarGrid);
    }
  };

  const renderFutureCalendarDateMarkingsForActiveRoutine = (
    calendarGrid: Element
  ) => {
    if (
      operatingYearMonth.current < currentMonth.current ||
      activeRoutine === undefined ||
      disableActiveRoutineOption.current ||
      IsRoutineCustomStartDateInvalid(activeRoutine)
    )
      return;

    const isCurrentMonth = operatingYearMonth.current === currentMonth.current;

    const dateRoutineScheduleMap = CreateDateRoutineScheduleListMap(
      activeRoutine,
      operatingYearMonth.current,
      userSettings.locale,
      isCurrentMonth
    );

    const dateWrapperCellMap = new Map<string, HTMLDivElement>();
    const dateWrapperCellList: HTMLDivElement[] = [];

    for (const [date, _workoutList] of dateRoutineScheduleMap) {
      let workoutList = _workoutList;

      const wrapperIdString = `${date}-marking-wrapper`;

      const isDateToday = date === currentDateString.current;

      if (isDateToday) {
        const existingWrapper = calendarGrid.querySelector(
          `[id="${wrapperIdString}"]`
        );

        if (existingWrapper) {
          dateWrapperCellMap.set(date, existingWrapper as HTMLDivElement);

          if (workoutsForCurrentDate.current.length > 0) {
            // Remove scheduled workout(s) that already has a CalendarWorkoutItem for today
            // (Remove items with same workout_template_id and routine_id from workoutList)

            const workoutCounts = workoutsForCurrentDate.current
              .filter((w) => w.routine_id === activeRoutine.id)
              .reduce<Record<number, number>>((acc, w) => {
                acc[w.workout_template_id] =
                  (acc[w.workout_template_id] || 0) + 1;
                return acc;
              }, {});

            const updatedWorkoutList: SimpleRoutineScheduleItem[] = [];

            for (const workout of workoutList) {
              const id = workout.workout_template_id;
              if (workoutCounts[id] && workoutCounts[id] > 0) {
                workoutCounts[id]--;
              } else {
                updatedWorkoutList.push(workout);
              }
            }

            workoutList = updatedWorkoutList;
          }
        }
      }

      const querySelectorString = GetCalendarDateQuerySelectorString(date);

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
        CreateCalendarDateWrapperDiv(
          date,
          wrapperIdString,
          wrapper,
          parentCell,
          dateWrapperCellMap
        );
      }

      for (const workout of workoutList) {
        // Do not add more than 16 dots per date
        if (wrapper.children.length >= 16) continue;

        const dotColorIndex =
          operatingCalendarMonth.routineWorkoutTemplateMap.get(
            workout.workout_template_id
          )!.index;

        const dotColor =
          CALENDAR_COLOR_LIST[dotColorIndex % CALENDAR_COLOR_LIST.length] +
          CALENDAR_DOT_FUTURE_ALPHA_CODE;

        const dot = CreateCalendarDotDiv(dotColor);

        wrapper.appendChild(dot);
      }

      dateWrapperCellList.push(wrapper);
    }

    futureWorkoutDateWrapperCellList.current = dateWrapperCellList;
  };

  const createWorkoutTemplateListDiv = (map: CalendarWorkoutTemplateMap) => (
    <CalendarModalLegend
      title="Workout Templates"
      emptyListText="No Workouts"
      items={Array.from(map)}
      renderItem={([id, item]) => {
        const textColor =
          CALENDAR_COLOR_LIST[item.index % CALENDAR_COLOR_LIST.length];

        return (
          <div
            key={id}
            className="text-xs truncate"
            style={{ color: textColor }}
          >
            {item.name}
          </div>
        );
      }}
    />
  );

  const workoutTemplateList = useMemo(
    () =>
      createWorkoutTemplateListDiv(operatingCalendarMonth.workoutTemplateMap),
    [operatingCalendarMonth]
  );

  const activeRoutineWorkoutTemplateList = useMemo(
    () =>
      createWorkoutTemplateListDiv(
        operatingCalendarMonth.routineWorkoutTemplateMap
      ),
    [operatingCalendarMonth]
  );

  const exerciseGroupList = useMemo(
    () => (
      <CalendarModalLegend
        title="Exercise Groups"
        emptyListText="No Sets Completed"
        items={Array.from(operatingCalendarMonth.exerciseGroupSet)}
        renderItem={(exerciseGroup, index) => {
          const textColor = CALENDAR_COLOR_LIST[index];

          return (
            <div
              key={exerciseGroup}
              className="text-xs truncate"
              style={{ color: textColor }}
            >
              {EXERCISE_GROUP_DICTIONARY.get(exerciseGroup)}
            </div>
          );
        }}
      />
    ),
    [operatingCalendarMonth]
  );

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
            <ModalHeader>Calendar</ModalHeader>
            <ModalBody className="py-0">
              <ScrollShadow
                className={`${MODAL_BODY_HEIGHT} flex flex-col items-center gap-2`}
                hideScrollBar
              >
                <div className="flex flex-col items-center gap-2">
                  <CalendarDateMarkingsDropdown
                    value={calendarDateMarking}
                    setValue={setCalendarDateMarking}
                    targetType="calendar-modal"
                    handleChangeInModal={handleCalendarDateMarkingChange}
                    isInCalendarModal
                    disableActiveRoutine={disableActiveRoutineOption.current}
                  />
                  <div className="max-h-[310px] flex gap-2.5">
                    <div>
                      <I18nProvider locale={userSettings.locale}>
                        <Calendar
                          calendarWidth={calendarWidth}
                          onFocusChange={(value) =>
                            handleCalendarMonthChange(
                              value,
                              userSettings.locale
                            )
                          }
                          onChange={(value) => handleDateClick(value)}
                        />
                      </I18nProvider>
                    </div>
                    {calendarDateMarking === "workout-templates"
                      ? workoutTemplateList
                      : calendarDateMarking === "exercise-groups"
                      ? exerciseGroupList
                      : calendarDateMarking === "active-routine"
                      ? activeRoutineWorkoutTemplateList
                      : null}
                  </div>
                </div>
                {operatingCalendarModalDate !== undefined && (
                  <div className="w-full px-1">
                    <div className="flex flex-col divide-y-1">
                      <h4 className="text-secondary text-lg font-medium leading-tight">
                        {operatingCalendarModalDate.date}
                      </h4>
                      <div className="px-px">
                        {operatingCalendarModalDate.workoutsWithGroupedSetList
                          .length > 0 ? (
                          <div>
                            {operatingCalendarModalDate.workoutsWithGroupedSetList.map(
                              (workoutAndSetList) => (
                                <div key={workoutAndSetList.workout.id}>
                                  {workoutAndSetList.workout.id}
                                  <div className="">
                                    {workoutAndSetList.groupedSetList.length >
                                    0 ? (
                                      <div></div>
                                    ) : (
                                      <div className="text-sm text-stone-400">
                                        No Sets Completed
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-stone-400">
                            No Workouts
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </ScrollShadow>
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
