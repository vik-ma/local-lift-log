import { Select, SelectItem } from "@nextui-org/react";
import { HTMLSelectElementChange } from "../../typings";

type DietLogDayDropdownProps = {
  value: string;
  targetType: "state" | "settings";
  setState?: React.Dispatch<React.SetStateAction<string>>;
  setUserSettings?: HTMLSelectElementChange;
};

export const DietLogDayDropdown = ({
  value,
  targetType,
  setState,
  setUserSettings,
}: DietLogDayDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);
    }

    if (targetType === "settings" && setUserSettings !== undefined) {
      setUserSettings(e);
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
