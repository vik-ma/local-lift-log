import { Select, SelectItem } from "@heroui/react";
import { useValidTimeInputBehaviors } from "../../hooks";
import { UpdateUserSettingFunction } from "../../typings";

type TimeInputBehaviorDropdownProps = {
  value: string;
  isHhmmss: boolean;
  updateUserSetting?: UpdateUserSettingFunction;
};

export const TimeInputBehaviorDropdown = ({
  value,
  isHhmmss,
  updateUserSetting,
}: TimeInputBehaviorDropdownProps) => {
  const validTimeInputBehaviors = useValidTimeInputBehaviors(isHhmmss);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (updateUserSetting !== undefined) {
      updateUserSetting(
        isHhmmss ? "time_input_behavior_hhmmss" : "time_input_behavior_mmss",
        e.target.value
      );
    }
  };

  return (
    <Select
      aria-label={
        isHhmmss
          ? "Time Input HH:MM:SS Behavior Dropdown List"
          : "Time Input MM:SS Behavior Dropdown List"
      }
      className="w-[17rem]"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {validTimeInputBehaviors.map((unit) => (
        <SelectItem key={unit.key}>{unit.label}</SelectItem>
      ))}
    </Select>
  );
};

export default TimeInputBehaviorDropdown;
