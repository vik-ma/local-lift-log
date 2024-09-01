import { Select, SelectItem } from "@nextui-org/react";
import { WorkoutRatingProps } from "../../typings";
import { useEffect, useMemo, useState } from "react";
import { useWorkoutRatingMap } from "../../hooks";

export const WorkoutRatingDropdown = ({
  rating,
  setWorkout,
}: WorkoutRatingProps) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([rating.toString()])
  );
  const selectedKey: string = useMemo(() => {
    return Array.from(selectedKeys)[0];
  }, [selectedKeys]);

  const { workoutRatingMap, validDropdownRatingKeys } = useWorkoutRatingMap();

  useEffect(() => {
    const ratingStr = rating.toString();

    if (!validDropdownRatingKeys.includes(ratingStr)) return;

    setSelectedKeys(new Set([ratingStr]));
  }, [rating, validDropdownRatingKeys]);

  const handleChange = async (keys: Set<string>) => {
    const stringValue: string = Array.from(keys)[0];

    if (!validDropdownRatingKeys.includes(stringValue)) return;

    const numberValue: number = Number(stringValue);

    setSelectedKeys(keys);
    setWorkout((prev) => ({ ...prev, rating: numberValue }));
  };

  return (
    <Select
      aria-label="Workout Rating"
      className="w-[7.5rem]"
      classNames={{
        value: workoutRatingMap[Number(selectedKey)].dropdownStyle,
      }}
      variant="faded"
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => handleChange(keys as Set<string>)}
      disallowEmptySelection
    >
      {Object.entries(workoutRatingMap).map(([key, value]) => (
        <SelectItem
          className={value.textStyle}
          key={key.toString()}
          value={key.toString()}
        >
          {value.text}
        </SelectItem>
      ))}
    </Select>
  );
};
