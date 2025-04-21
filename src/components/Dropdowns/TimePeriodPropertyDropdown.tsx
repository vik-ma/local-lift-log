import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { UserSettings } from "../../typings";
import Database from "tauri-plugin-sql-api";
import { ValidTimePeriodPropertiesMap } from "../../helpers";
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

      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        await db.execute(
          "UPDATE user_settings SET shown_time_period_properties = $1 WHERE id = $2",
          [timePeriodPropertyString, userSettings.id]
        );

        const updatedUserSettings = {
          ...userSettings,
          shown_time_period_properties: timePeriodPropertyString,
        };

        setUserSettings(updatedUserSettings);

        if (isInSettingsPage) {
          toast.success("Setting Updated");
        }
      } catch (error) {
        console.log(error);
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
