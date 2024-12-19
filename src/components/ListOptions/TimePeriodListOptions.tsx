import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useMemo } from "react";
import { ValidTimePeriodPropertiesMap } from "../../helpers";

type TimePeriodListOptionsProps = {
  selectedTimePeriodProperties: Set<string>;
  setSelectedTimePeriodProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  isInSettingsPage?: boolean;
};

export const TimePeriodListOptions = ({
  selectedTimePeriodProperties,
  setSelectedTimePeriodProperties,
  isInSettingsPage,
}: TimePeriodListOptionsProps) => {
  const timePeriodProperties = useMemo(() => {
    return ValidTimePeriodPropertiesMap();
  }, []);

  const handleChange = async (keys: Set<string>) => {
    setSelectedTimePeriodProperties(keys);

    // TODO: ADD SETTINGS
  };

  return (
    <div className="flex gap-1 pr-0.5">
      <Dropdown>
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
    </div>
  );
};
