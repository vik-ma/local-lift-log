import { Select, SelectItem } from "@nextui-org/react";
import { WorkoutRatingProps } from "../../typings";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";
import { useMemo, useState } from "react";

export const WorkoutRatingDropdown = ({
  rating,
  workout_id,
}: WorkoutRatingProps) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([rating.toString()])
  );
  const selectedKey: string = useMemo(() => {
    return Array.from(selectedKeys)[0];
  }, [selectedKeys]);

  const validRatings: string[] = useMemo(() => {
    return ["0", "1", "2"];
  }, []);

  const handleChange = async (keys: Set<string>) => {
    const stringValue: string = Array.from(keys)[0];

    if (!validRatings.includes(stringValue)) return;

    const numberValue: number = Number(stringValue);

    await updateWorkoutRating(numberValue);
    setSelectedKeys(keys);
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
        classNames={
          selectedKey === "1"
            ? {
                value: "group-data-[has-value=true]:text-success",
              }
            : selectedKey === "2"
            ? {
                value: "group-data-[has-value=true]:text-danger",
              }
            : { value: "" }
        }
        variant="flat"
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => handleChange(keys as Set<string>)}
        disallowEmptySelection
      >
        <SelectItem key="0" value="0">
          No Rating
        </SelectItem>
        <SelectItem className="text-success" key="1" value="1">
          Good
        </SelectItem>
        <SelectItem className="text-danger" key="2" value="2">
          Bad
        </SelectItem>
      </Select>
    </>
  );
};