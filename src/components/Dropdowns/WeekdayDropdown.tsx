import { Select, SelectItem } from "@heroui/react";

type WeekdayDropdownProps = {
  value: number;
  label: string;
  weekdayMap: Map<string, string>;
  targetType: "routine";
  updateRoutineStartDay?: (weekdayNum: string) => void;
};

export const WeekdayDropdown = ({
  value,
  label,
  weekdayMap,
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
      {Array.from(weekdayMap).map(([weekdayNum, weekdayLabel]) => (
        <SelectItem key={weekdayNum} value={weekdayNum}>
          {weekdayLabel}
        </SelectItem>
      ))}
    </Select>
  );
};
