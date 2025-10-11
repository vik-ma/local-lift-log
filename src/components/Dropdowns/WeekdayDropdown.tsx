import { Select, SelectItem } from "@heroui/react";
import { WEEKDAY_LIST } from "../../constants";

type WeekdayDropdownProps = {
  value: number;
  label: string;
  targetType: "routine";
  updateRoutineStartDay?: (weekdayNum: string) => void;
};

export const WeekdayDropdown = ({
  value,
  label,
  targetType,
  updateRoutineStartDay,
}: WeekdayDropdownProps) => {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "routine" && updateRoutineStartDay !== undefined) {
      updateRoutineStartDay(e.target.value);
    }
  };

  return (
    <Select
      className="w-[8.5rem]"
      label={label}
      variant="faded"
      size="sm"
      radius="md"
      selectedKeys={value.toString()}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
      disableAnimation
    >
      {WEEKDAY_LIST.map((weekday) => (
        <SelectItem key={weekday}>{weekday}</SelectItem>
      ))}
    </Select>
  );
};
