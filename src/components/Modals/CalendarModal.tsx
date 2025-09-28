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
import { UseCalendarModalReturnType, UserSettings } from "../../typings";
import { CALENDAR_COLOR_LIST, MODAL_BODY_HEIGHT } from "../../constants";
import { useEffect, useMemo } from "react";
import { I18nProvider } from "@react-aria/i18n";
import { FormatISODateStringToCalendarAriaLabelString } from "../../helpers";
import { CalendarDateMarkingsDropdown } from "..";

type CalendarModalProps = {
  useCalendarModal: UseCalendarModalReturnType;
  userSettings: UserSettings;
};

export const CalendarModal = ({
  useCalendarModal,
  userSettings,
}: CalendarModalProps) => {
  const {
    calendarModal,
    operatingCalendarMonth,
    isCalendarWorkoutListLoaded,
    handleCalendarMonthChange,
    currentDateString,
    calendarDateMarking,
    setCalendarDateMarking,
  } = useCalendarModal;

  const calendarWidth =
    calendarDateMarking === "workouts" || calendarDateMarking === "none"
      ? 290
      : 250;

  const renderWorkoutListOverlay = () => {
    const dateWrapperCellMap = new Map<string, HTMLDivElement>();

    let isBuildingNewMap = false;

    for (const workout of operatingCalendarMonth.workoutList) {
      const date = FormatISODateStringToCalendarAriaLabelString(
        workout.date,
        userSettings.locale
      );

      const wrapperIdString = `${date}-marking-wrapper`;

      const existingWrapper = document.getElementById(wrapperIdString);

      if (existingWrapper && !isBuildingNewMap) {
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

      const dot = document.createElement("div");

      dot.style.width = "6px";
      dot.style.height = "6px";
      dot.style.borderRadius = "50%";

      let wrapper = document.createElement("div");

      if (dateWrapperCellMap.has(date)) {
        wrapper = dateWrapperCellMap.get(date)!;

        const numExistingDots = wrapper.children.length;

        // Do not add more than 16 dots per date
        if (numExistingDots >= 16) continue;

        dot.style.backgroundColor = CALENDAR_COLOR_LIST[numExistingDots];
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

        dot.style.backgroundColor = CALENDAR_COLOR_LIST[0];

        isBuildingNewMap = true;
      }

      wrapper.appendChild(dot);
    }
  };

  const workoutTemplateList = useMemo(() => {
    if (operatingCalendarMonth.workoutList.length === 0) {
      return (
        <div className="w-[9.1rem] text-center text-sm text-stone-400">
          No Workouts
        </div>
      );
    }

    return (
      <div className="flex flex-col max-h-[274px]">
        <h4 className="font-medium text-sm">Workout Templates</h4>
        <ScrollShadow className="w-[9.125rem]">
          {Array.from(operatingCalendarMonth.workoutTemplateMap).map(
            ([id, name], index) => {
              const textColor = CALENDAR_COLOR_LIST[
                index % CALENDAR_COLOR_LIST.length
              ].substring(0, 7);

              return (
                <div
                  key={id}
                  className="text-xs truncate"
                  style={{ color: textColor }}
                >
                  {name}
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

    renderWorkoutListOverlay();

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
              <div
                className={`${MODAL_BODY_HEIGHT} flex flex-col items-center gap-2`}
              >
                <CalendarDateMarkingsDropdown
                  value={calendarDateMarking}
                  setValue={setCalendarDateMarking}
                  targetType="state"
                  isInCalendarModal
                />
                <div className="max-h-[310px] flex gap-2">
                  <I18nProvider locale={userSettings.locale}>
                    <Calendar
                      calendarWidth={calendarWidth}
                      onFocusChange={(value) =>
                        handleCalendarMonthChange(value)
                      }
                    />
                  </I18nProvider>
                  {calendarDateMarking === "workout-templates" &&
                    workoutTemplateList}
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
