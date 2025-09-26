import { Select, SelectItem } from "@heroui/react";
import { CALENDAR_DISPLAY_OPTIONS_MAP } from "../../constants";
import { UpdateUserSettingFunction } from "../../typings";

type CalendarDisplayOptionsDropdownProps = {
  value: string;
  targetType: "settings" | "state";
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  updateUserSetting?: UpdateUserSettingFunction;
  isInCalendarModal?: boolean;
};

export const CalendarDisplayOptionsDropdown = ({
  value,
  targetType,
  setValue,
  updateUserSetting,
  isInCalendarModal,
}: CalendarDisplayOptionsDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting("calendar_display_option", e.target.value);
    }

    if (targetType === "state" && setValue !== undefined) {
      setValue(e.target.value);
    }
  };

  return (
    <div>
      <Select
        aria-label="Calendar Display Options Dropdown List"
        label={isInCalendarModal ? "Date Markings" : undefined}
        size={isInCalendarModal ? "sm" : "md"}
        labelPlacement="outside-left"
        classNames={{
          label: isInCalendarModal ? "text-sm" : "",
          mainWrapper: "w-[11.25rem]",
        }}
        variant="faded"
        selectedKeys={[value]}
        onChange={(e) => handleChange(e)}
        disallowEmptySelection
      >
        {Array.from(CALENDAR_DISPLAY_OPTIONS_MAP).map(([key, value]) => (
          <SelectItem key={key}>{value}</SelectItem>
        ))}
      </Select>
    </div>
  );
};
