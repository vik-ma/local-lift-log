import { TimePeriodPropertyDropdown } from "..";
import { UserSettings, UseTimePeriodListReturnType } from "../../typings";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

type TimePeriodListOptionsProps = {
  useTimePeriodList: UseTimePeriodListReturnType;
  selectedTimePeriodProperties: Set<string>;
  setSelectedTimePeriodProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const TimePeriodListOptions = ({
  useTimePeriodList,
  selectedTimePeriodProperties,
  setSelectedTimePeriodProperties,
  userSettings,
  setUserSettings,
}: TimePeriodListOptionsProps) => {
  const { sortCategory, handleSortOptionSelection } = useTimePeriodList;

  return (
    <div className="flex gap-1 pr-0.5">
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
            Start Date (Newest First)
          </DropdownItem>
          <DropdownItem key="start-date-asc">
            Start Date (Oldest First)
          </DropdownItem>
          <DropdownItem key="end-date-desc">
            End Date (Newest First)
          </DropdownItem>
          <DropdownItem key="end-date-asc">
            End Date (Oldest First)
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
