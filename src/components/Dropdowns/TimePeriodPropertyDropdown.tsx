import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { UserSettings } from "../../typings";
import { UpdateUserSetting, ValidTimePeriodPropertiesMap } from "../../helpers";
import { useMemo } from "react";
import toast from "react-hot-toast";

type TimePeriodPropertyDropdownProps = {
  selectedTimePeriodProperties: Set<string>;
  setSelectedTimePeriodProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  isInSettingsPage?: boolean;
};

export const TimePeriodPropertyDropdown = ({
  selectedTimePeriodProperties,
  setSelectedTimePeriodProperties,
  userSettings,
  setUserSettings,
  isInSettingsPage,
}: TimePeriodPropertyDropdownProps) => {
  const timePeriodProperties = useMemo(() => {
    return ValidTimePeriodPropertiesMap();
  }, []);

  const handleChange = async (keys: Set<string>) => {
    setSelectedTimePeriodProperties(keys);

    if (userSettings !== undefined && setUserSettings !== undefined) {
      const timePeriodPropertyString = Array.from(keys).join(",");

      const success = await UpdateUserSetting(
        "shown_time_period_properties",
        timePeriodPropertyString,
        userSettings,
        setUserSettings
      );

      if (success && isInSettingsPage) {
        toast.success("Setting Updated");
      }
    }
  };

  return (
    <Dropdown shouldBlockScroll={false}>
      <DropdownTrigger>
        <Button
          aria-label="Toggle Display Time Period Properties Options Menu"
          className="z-1"
          variant={isInSettingsPage ? "solid" : "flat"}
          color={isInSettingsPage ? "primary" : "default"}
          size="sm"
        >
          {isInSettingsPage ? "Select" : "Display"}
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
