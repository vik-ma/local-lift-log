import { Select, SelectItem } from "@nextui-org/react";
import { WorkoutRatingProps } from "../typings";

export const WorkoutRatingDropdown = ({
  rating,
  workout_id,
}: WorkoutRatingProps) => {
  const choiceMap = new Map<string, number>([
    ["No Rating", 0],
    ["Bad", 1],
    ["Good", 2],
  ]);

  const reverseChoiceMap = new Map<number, string>([
    [0, "No Rating"],
    [1, "Bad"],
    [2, "Good"],
  ]);

  const stringValue: string = reverseChoiceMap.get(value) ?? "No Rating";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const numberValue: number | undefined = choiceMap.get(e.target.value);

    if (numberValue === undefined) return;
  };

  return (
    <Select
      aria-label="Workout Rating"
      className="max-w-[8rem]"
      variant="faded"
      selectedKeys={[stringValue]}
      onChange={(e) => handleChange(e)}
    >
      {Array.from(choiceMap.keys()).map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};
