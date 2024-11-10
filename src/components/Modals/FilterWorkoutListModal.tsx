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
                <div className="flex flex-col gap-2 w-[24rem]">
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
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleFilterDoneButton}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
