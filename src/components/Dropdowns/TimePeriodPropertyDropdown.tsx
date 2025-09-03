import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { UserSettings } from "../../typings";
import { UpdateUserSetting } from "../../helpers";
import { VALID_TIME_PERIOD_PROPERTIES_MAP } from "../../constants";

type TimePeriodPropertyDropdownProps = {
  selectedTimePeriodProperties: Set<string>;
  setSelectedTimePeriodProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const TimePeriodPropertyDropdown = ({
  selectedTimePeriodProperties,
  setSelectedTimePeriodProperties,
  userSettings,
  setUserSettings,
}: TimePeriodPropertyDropdownProps) => {
  const timePeriodProperties = VALID_TIME_PERIOD_PROPERTIES_MAP;

  const handleChange = async (keys: Set<string>) => {
    setSelectedTimePeriodProperties(keys);

    const timePeriodPropertyString = Array.from(keys).join(",");

    await UpdateUserSetting(
      "shown_time_period_properties",
      timePeriodPropertyString,
      userSettings,
      setUserSettings
    );
  };

  return (
    <Dropdown shouldBlockScroll={false}>
      <DropdownTrigger>
        <Button
          aria-label="Toggle Display Time Period Properties Options Menu"
          className="z-1"
          variant="flat"
          size="sm"
        >
          Display
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Display Time Period Properties Menu"
        closeOnSelect={false}
        selectionMode="multiple"
        selectedKeys={selectedTimePeriodProperties}
        onSelectionChange={(keys) => handleChange(keys as Set<string>)}
      >
        {Array.from(timePeriodProperties).map(([key, value]) => (
          <DropdownItem key={key}>{value}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
