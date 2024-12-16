import { Button, useDisclosure } from "@nextui-org/react";
import {
  ListPageSearchInput,
  LoadingSpinner,
  TimePeriodModal,
} from "../components";
import {
  useDefaultTimePeriod,
  useTimePeriodInputs,
  useTimePeriodList,
} from "../hooks";
import { useState } from "react";
import { TimePeriod } from "../typings";

type OperationType = "add" | "edit" | "delete";

export default function TimePeriodList() {
  const [operationType, setOperationType] = useState<OperationType>("add");

  const defaultTimePeriod = useDefaultTimePeriod();

  const [operatingTimePeriod, setOperatingTimePeriod] =
    useState<TimePeriod>(defaultTimePeriod);

  const timePeriodModal = useDisclosure();

  const isTimePeriodValid = useTimePeriodInputs(operatingTimePeriod);

  const timePeriodList = useTimePeriodList(true);

  const {
    timePeriods,
    setTimePeriods,
    filteredTimePeriods,
    filterQuery,
    setFilterQuery,
    isTimePeriodListLoaded,
  } = timePeriodList;

  const resetOperatingTimePeriod = () => {
    setOperationType("add");
    setOperatingTimePeriod(defaultTimePeriod);
  };

  const handleCreateNewTimePeriodButton = () => {
    if (operationType !== "add") {
      resetOperatingTimePeriod();
    }
    timePeriodModal.onOpen();
  };

  if (!isTimePeriodListLoaded.current) return <LoadingSpinner />;

  return (
    <>
      <TimePeriodModal
        timePeriodModal={timePeriodModal}
        timePeriod={operatingTimePeriod}
        setTimePeriod={setOperatingTimePeriod}
        useTimePeriodInputs={isTimePeriodValid}
        // TODO: ADD
        buttonAction={() => {}}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Time Period List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredTimePeriods.length}
          totalListLength={timePeriods.length}
          // TODO: CHANGE IF ADDING FILTERS
          isListFiltered={false}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleCreateNewTimePeriodButton}
                  size="sm"
                >
                  New Time Period
                </Button>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
}
