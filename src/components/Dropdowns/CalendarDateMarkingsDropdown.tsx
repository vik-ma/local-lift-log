import { Select, SelectItem } from "@heroui/react";
import { CALENDAR_DATE_MARKINGS_MAP } from "../../constants";
import { UpdateUserSettingFunction } from "../../typings";

type CalendarDateMarkingsDropdownProps = {
  value: string;
  targetType: "settings" | "state";
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  updateUserSetting?: UpdateUserSettingFunction;
  isInCalendarModal?: boolean;
  disableActiveRoutine?: boolean;
};

export const CalendarDateMarkingsDropdown = ({
  value,
  targetType,
  setValue,
  updateUserSetting,
  isInCalendarModal,
  disableActiveRoutine,
}: CalendarDateMarkingsDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting("calendar_date_marking", e.target.value);
    }

    if (targetType === "state" && setValue !== undefined) {
      setValue(e.target.value);
    }
  };

  return (
    <div>
      <Select
        aria-label="Calendar Date Markings Dropdown List"
        label={isInCalendarModal ? "Date Markings" : undefined}
        size={isInCalendarModal ? "sm" : "md"}
        labelPlacement="outside-left"
        classNames={{
          label: isInCalendarModal ? "text-sm" : "",
          mainWrapper: "w-[11.5rem]",
        }}
        variant="faded"
        selectedKeys={[value]}
        onChange={(e) => handleChange(e)}
        disabledKeys={disableActiveRoutine ? ["active-routine"] : []}
        disallowEmptySelection
      >
        {Array.from(CALENDAR_DATE_MARKINGS_MAP).map(([key, value]) => (
          <SelectItem key={key}>{value}</SelectItem>
        ))}
      </Select>
    </div>
  );
};
