import { TimePeriodPropertyDropdown } from "..";
import { UserSettings, UseTimePeriodListReturnType } from "../../typings";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";

type TimePeriodListOptionsProps = {
  useTimePeriodList: UseTimePeriodListReturnType;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const TimePeriodListOptions = ({
  useTimePeriodList,
  userSettings,
  setUserSettings,
}: TimePeriodListOptionsProps) => {
  const {
    sortCategory,
    handleSortOptionSelection,
    handleOpenFilterButton,
    timePeriodListFilters,
    selectedTimePeriodProperties,
    setSelectedTimePeriodProperties,
  } = useTimePeriodList;

  return (
    <div className="flex gap-1 pr-0.5">
      <Button
        className="z-1"
        variant="flat"
        color={
          timePeriodListFilters.filterMap.size > 0 ? "secondary" : "default"
        }
        size="sm"
        onPress={handleOpenFilterButton}
      >
        Filter
      </Button>
      <Dropdown>
        <DropdownTrigger>
          <Button className="z-1" variant="flat" size="sm">
            Sort By
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Sort Workouts Dropdown Menu"
          selectionMode="single"
          selectedKeys={[sortCategory]}
          onAction={(key) => handleSortOptionSelection(key as string)}
        >
          <DropdownItem key="ongoing">Ongoing First</DropdownItem>
          <DropdownItem key="name">Name (A-Z)</DropdownItem>
          <DropdownItem key="start-date-desc">
            Start Date (Latest First)
          </DropdownItem>
          <DropdownItem key="start-date-asc">
            Start Date (Oldest First)
          </DropdownItem>
          <DropdownItem key="end-date-desc">
            End Date (Latest First)
          </DropdownItem>
          <DropdownItem key="end-date-asc">
            End Date (Oldest First)
          </DropdownItem>
          <DropdownItem key="length-desc">
            Duration (Longest First)
          </DropdownItem>
          <DropdownItem key="length-asc">
            Duration (Shortest First)
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <TimePeriodPropertyDropdown
        selectedTimePeriodProperties={selectedTimePeriodProperties}
        setSelectedTimePeriodProperties={setSelectedTimePeriodProperties}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
    </div>
  );
};
