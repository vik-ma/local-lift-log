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
import { useEffect, useState } from "react";
import { TimePeriod, UserSettings } from "../typings";
import { GetUserSettings } from "../helpers";

type OperationType = "add" | "edit" | "delete";

export default function TimePeriodList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
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

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

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

  if (userSettings === undefined || !isTimePeriodListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <TimePeriodModal
        timePeriodModal={timePeriodModal}
        timePeriod={operatingTimePeriod}
        setTimePeriod={setOperatingTimePeriod}
        useTimePeriodInputs={isTimePeriodValid}
        userSettings={userSettings}
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
