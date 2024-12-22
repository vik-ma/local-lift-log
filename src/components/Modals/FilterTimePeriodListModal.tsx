import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  DatePicker,
} from "@nextui-org/react";
import { UseTimePeriodListReturnType } from "../../typings";
import { I18nProvider } from "@react-aria/i18n";
import { FilterMinAndMaxValues } from "..";
import { useFilterMinAndMaxValueInputs } from "../../hooks";
import { useMemo } from "react";

type FilterTimePeriodListModalProps = {
  useTimePeriodList: UseTimePeriodListReturnType;
  locale: string;
};

export const FilterTimePeriodListModal = ({
  useTimePeriodList,
  locale,
}: FilterTimePeriodListModalProps) => {
  const { filterTimePeriodListModal, timePeriodListFilters } =
    useTimePeriodList;

  const {
    filterMinStartDate,
    setFilterMinStartDate,
    filterMaxStartDate,
    setFilterMaxStartDate,
    filterMinEndDate,
    setFilterMinEndDate,
    filterMaxEndDate,
    setFilterMaxEndDate,
    handleFilterSaveButton,
    setFilterMinDuration,
    setFilterMaxDuration,
  } = timePeriodListFilters;

  const filterMinAndMaxValueInputs = useFilterMinAndMaxValueInputs(
    1,
    undefined,
    true
  );

  const isFilterButtonDisabled = useMemo(() => {
    return (
      filterMinAndMaxValueInputs.isMinInputInvalid ||
      filterMinAndMaxValueInputs.isMaxInputInvalid
    );
  }, [
    filterMinAndMaxValueInputs.isMinInputInvalid,
    filterMinAndMaxValueInputs.isMaxInputInvalid,
  ]);

  return (
    <Modal
      isOpen={filterTimePeriodListModal.isOpen}
      onOpenChange={filterTimePeriodListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Time Periods</ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-3">
                <div className="flex gap-4 justify-between pt-1">
                  <div className="relative w-full">
                    <I18nProvider locale={locale}>
                      <DatePicker
                        classNames={{ base: "gap-0.5" }}
                        dateInputClassNames={{
                          inputWrapper: "!bg-default-100",
                        }}
                        label={
                          <span className="text-base font-semibold px-0.5">
                            Min Start Date
                          </span>
                        }
                        labelPlacement="outside"
                        variant="faded"
                        value={filterMinStartDate}
                        onChange={setFilterMinStartDate}
                      />
                    </I18nProvider>
                    {filterMinStartDate !== null && (
                      <Button
                        aria-label="Reset Min Date"
                        className="absolute right-0 -top-1.5 h-7"
                        size="sm"
                        variant="flat"
                        onPress={() => setFilterMinStartDate(null)}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="relative w-full">
                    <I18nProvider locale={locale}>
                      <DatePicker
                        classNames={{ base: "gap-0.5" }}
                        dateInputClassNames={{
                          inputWrapper: "!bg-default-100",
                        }}
                        label={
                          <span className="text-base font-semibold px-0.5">
                            Max Start Date
                          </span>
                        }
                        labelPlacement="outside"
                        variant="faded"
                        value={filterMaxStartDate}
                        onChange={setFilterMaxStartDate}
                      />
                    </I18nProvider>
                    {filterMaxStartDate !== null && (
                      <Button
                        aria-label="Reset Max Date"
                        className="absolute right-0 -top-1.5 h-7"
                        size="sm"
                        variant="flat"
                        onPress={() => setFilterMaxStartDate(null)}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 justify-between pt-1">
                  <div className="relative w-full">
                    <I18nProvider locale={locale}>
                      <DatePicker
                        classNames={{ base: "gap-0.5" }}
                        dateInputClassNames={{
                          inputWrapper: "!bg-default-100",
                        }}
                        label={
                          <span className="text-base font-semibold px-0.5">
                            Min End Date
                          </span>
                        }
                        labelPlacement="outside"
                        variant="faded"
                        value={filterMinEndDate}
                        onChange={setFilterMinEndDate}
                      />
                    </I18nProvider>
                    {filterMinEndDate !== null && (
                      <Button
                        aria-label="Reset Min Date"
                        className="absolute right-0 -top-1.5 h-7"
                        size="sm"
                        variant="flat"
                        onPress={() => setFilterMinEndDate(null)}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="relative w-full">
                    <I18nProvider locale={locale}>
                      <DatePicker
                        classNames={{ base: "gap-0.5" }}
                        dateInputClassNames={{
                          inputWrapper: "!bg-default-100",
                        }}
                        label={
                          <span className="text-base font-semibold px-0.5">
                            Max End Date
                          </span>
                        }
                        labelPlacement="outside"
                        variant="faded"
                        value={filterMaxEndDate}
                        onChange={setFilterMaxEndDate}
                      />
                    </I18nProvider>
                    {filterMaxEndDate !== null && (
                      <Button
                        aria-label="Reset Max Date"
                        className="absolute right-0 -top-1.5 h-7"
                        size="sm"
                        variant="flat"
                        onPress={() => setFilterMaxEndDate(null)}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
                <FilterMinAndMaxValues
                  setFilterMinValue={setFilterMinDuration}
                  setFilterMaxValue={setFilterMaxDuration}
                  label="Duration (Days)"
                  useFilterMinAndMaxValueInputs={filterMinAndMaxValueInputs}
                  isSmall
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={() =>
                  handleFilterSaveButton(locale, filterTimePeriodListModal)
                }
                isDisabled={isFilterButtonDisabled}
              >
                Filter
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
