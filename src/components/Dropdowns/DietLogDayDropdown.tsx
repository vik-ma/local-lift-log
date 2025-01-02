import { Select, SelectItem } from "@nextui-org/react";

type DietLogDayDropdownProps = {
  value: string;
  targetType: "state" | "settings";
  setState?: React.Dispatch<React.SetStateAction<string>>;
};

export const DietLogDayDropdown = ({
  value,
  targetType,
  setState,
}: DietLogDayDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);
    }
  };

  return (
    <Select
      className="w-[7.5rem]"
      classNames={{ label: "mt-1 text-base font-semibold px-0.5" }}
      label="Day Of Diet"
      labelPlacement="outside"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      <SelectItem key="Today">Today</SelectItem>
      <SelectItem key="Yesterday">Yesterday</SelectItem>
    </Select>
  );
};
