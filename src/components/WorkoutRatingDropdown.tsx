import { Select, SelectItem } from "@nextui-org/react";
import { WorkoutRatingProps } from "../typings";

export const WorkoutRatingDropdown = ({
  rating,
  workout_id,
}: WorkoutRatingProps) => {
  const validRatings: string[] = ["0", "1", "2"];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!validRatings.includes(e.target.value)) return;

    const numberValue: number = Number(e.target.value);
    console.log(numberValue);
  };

  return (
    <Select
      aria-label="Workout Rating"
      className="max-w-[8rem]"
      variant="faded"
      defaultSelectedKeys={[rating.toString()]}
      onChange={(e) => handleChange(e)}
    >
      <SelectItem key="0" value="0">
        No Rating
      </SelectItem>
      <SelectItem key="1" value="1">
        Good
      </SelectItem>
      <SelectItem key="2" value="2">
        Bad
      </SelectItem>
    </Select>
  );
};
