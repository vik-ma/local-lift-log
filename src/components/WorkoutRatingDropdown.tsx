import { Select, SelectItem } from "@nextui-org/react";
import { WorkoutRatingProps } from "../typings";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";

export const WorkoutRatingDropdown = ({
  rating,
  workout_id,
}: WorkoutRatingProps) => {
  const validRatings: string[] = ["0", "1", "2"];

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!validRatings.includes(e.target.value)) return;

    const numberValue: number = Number(e.target.value);

    await updateWorkoutRating(numberValue);
  };

  const updateWorkoutRating = async (ratingValue: number) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(`UPDATE workouts SET rating = $1 WHERE id = $2`, [
        ratingValue,
        workout_id,
      ]);

      toast.success("Workout Rating Updated");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Select
        aria-label="Workout Rating"
        className="w-[7.5rem]"
        variant="flat"
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
    </>
  );
};
