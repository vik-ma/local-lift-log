import { Button, Select, SelectItem } from "@heroui/react";

type MultipleChoiceWeekdayDropdownProps = {
  values: Set<string>;
  setValues: React.Dispatch<React.SetStateAction<Set<string>>>;
  weekdayMap: Map<string, string>;
};

export const MultipleChoiceWeekdayDropdown = ({
  values,
  setValues,
  weekdayMap,
}: MultipleChoiceWeekdayDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const weekdayKeys = e.target.value.split(",");
    // Sort the keys 1-6 numerically, with 0 (Sunday) always last
    weekdayKeys.sort((a, b) => {
      if (a === "0") return 1;
      if (b === "0") return -1;
      return Number(a) - Number(b);
    });

    const updatedSet = new Set(weekdayKeys);
    setValues(updatedSet);
  };

  return (
    <div className="relative w-full">
      <Select
        selectionMode="multiple"
        label={
          <>
            Weekdays
            {values.size > 0 && (
              <span className="text-secondary">
                {" "}
                ({values.size} out of {weekdayMap.size})
              </span>
            )}
          </>
        }
        variant="faded"
        size="sm"
        radius="md"
        selectedKeys={values}
        onChange={(e) => handleChange(e)}
        disableAnimation
      >
        {Array.from(weekdayMap).map(([weekdayNum, weekdayLabel]) => (
          <SelectItem key={weekdayNum}>{weekdayLabel}</SelectItem>
        ))}
      </Select>
      {values.size > 0 && (
        <Button
          aria-label="Reset Weekday Selection"
          className="absolute right-0 -top-[2rem] h-7"
          size="sm"
          variant="flat"
          onPress={() => setValues(new Set())}
        >
          Reset
        </Button>
      )}
    </div>
  );
};
