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
import { useState } from "react";

type FilterWorkoutListModalProps = {
  useWorkoutList: UseWorkoutListReturnType;
  locale: string;
};

type FilterWorkoutListModalPage = "base" | "routine-list";

export const FilterWorkoutListModal = ({
  useWorkoutList,
  locale,
}: FilterWorkoutListModalProps) => {
  const [filterWorkoutListModalPage, setFilterWorkoutListModalPage] =
    useState<FilterWorkoutListModalPage>("base");

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
                {filterWorkoutListModalPage === "routine-list" ? (
                  <div>Test</div>
                ) : (
                  <div className="flex flex-col gap-3 w-[24rem]">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-lg px-0.5">
                        Date Range
                      </h3>
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
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-lg px-0.5">Routines</h3>
                      <div className="flex justify-between items-center px-1">
                        <div className="w-[16rem]"></div>
                        <Button
                          variant="flat"
                          size="sm"
                          onPress={() =>
                            setFilterWorkoutListModalPage("routine-list")
                          }
                        >
                          Filter Routines
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollShadow>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {filterWorkoutListModalPage !== "base" ? (
                  <Button
                    variant="flat"
                    onPress={() => setFilterWorkoutListModalPage("base")}
                  >
                    Back
                  </Button>
                ) : (
                  <>
                    {showResetFilterButton && (
                      <Button
                        variant="flat"
                        color="danger"
                        onPress={resetFilter}
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleFilterDoneButton(locale)}
                  isDisabled={filterWorkoutListModalPage !== "base"}
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
