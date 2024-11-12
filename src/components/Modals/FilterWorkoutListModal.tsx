import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  DateRangePicker,
  ScrollShadow,
} from "@nextui-org/react";
import { UseWorkoutListReturnType } from "../../typings";
import { I18nProvider } from "@react-aria/i18n";
import { WeekdaysDropdown } from "../Dropdowns/WeekdaysDropdown";

type FilterWorkoutListModal = {
  useWorkoutList: UseWorkoutListReturnType;
  locale: string;
};

export const FilterWorkoutListModal = ({
  useWorkoutList,
  locale,
}: FilterWorkoutListModal) => {
  const {
    filterWorkoutListModal,
    handleFilterDoneButton,
    filterDateRange,
    setFilterDateRange,
    resetFilter,
    showResetFilterButton,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
  } = useWorkoutList;

  return (
    <Modal
      isOpen={filterWorkoutListModal.isOpen}
      onOpenChange={filterWorkoutListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Workouts</ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[440px]">
                <div className="flex flex-col gap-3 w-[24rem]">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg px-0.5">Date Range</h3>
                    <I18nProvider locale={locale}>
                      <DateRangePicker
                        label="Workout Dates"
                        variant="faded"
                        value={filterDateRange}
                        onChange={setFilterDateRange}
                        visibleMonths={2}
                      />
                    </I18nProvider>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg px-0.5">Weekdays</h3>
                    <WeekdaysDropdown
                      values={filterWeekdays}
                      setValues={setFilterWeekdays}
                      weekdayMap={weekdayMap}
                    />
                  </div>
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {showResetFilterButton && (
                  <Button variant="flat" onPress={resetFilter}>
                    Reset All Filters
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleFilterDoneButton(locale)}
                >
                  Save
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
