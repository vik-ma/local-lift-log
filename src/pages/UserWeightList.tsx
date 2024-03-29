import Database from "tauri-plugin-sql-api";
import { useState, useEffect } from "react";
import { UserWeight } from "../typings";
import { LoadingSpinner } from "../components";
import { FormatDateString } from "../helpers";

export default function UserWeightListPage() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getUserWeights = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserWeight[]>(
          "SELECT * FROM user_weights"
        );

        const userWeights: UserWeight[] = result.map((row) => {
          const formattedDate: string = FormatDateString(row.date);
          return {
            id: row.id,
            weight: row.weight,
            weight_unit: row.weight_unit,
            date: row.date,
            formattedDate: formattedDate,
          };
        });

        setUserWeights(userWeights);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getUserWeights();
  }, []);
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Weight List
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              {userWeights.map((userWeight) => (
                <div
                  className="flex justify-between gap-2 font-medium"
                  key={`${userWeight.id}`}
                >
                  <span>
                    {userWeight.weight}
                    {userWeight.weight_unit}
                  </span>
                  <span className="text-stone-400">
                    {userWeight.formattedDate}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
