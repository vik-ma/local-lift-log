import { Select, SelectItem } from "@heroui/react";
import { useValidTimeInputBehaviors } from "../../hooks";

type TimeInputBehaviorDropdownProps = {
  value: string;
  isHhmmss: boolean;
  setUserSettings?: (
    e: React.ChangeEvent<HTMLSelectElement>,
    isHhmmss: boolean
  ) => Promise<void>;
};

export const TimeInputBehaviorDropdown = ({
  value,
  isHhmmss,
  setUserSettings,
}: TimeInputBehaviorDropdownProps) => {
  const validTimeInputBehaviors = useValidTimeInputBehaviors(isHhmmss);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (setUserSettings !== undefined) {
      setUserSettings(e, isHhmmss);
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
