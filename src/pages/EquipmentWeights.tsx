import { useState, useEffect } from "react";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { EquipmentWeight } from "../typings";

export default function EquipmentWeights() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>();

  useEffect(() => {
    const getEquipmentWeights = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<EquipmentWeight[]>(
          "SELECT * FROM equipment_weights"
        );

        const equipmentWeights: EquipmentWeight[] = result.map((row) => ({
          id: row.id,
          name: row.name,
          weight: row.weight,
          weight_unit: row.weight_unit,
        }));

        setEquipmentWeights(equipmentWeights);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getEquipmentWeights();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Equipment
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1">
              {equipmentWeights?.map((equipment) => (
                <div
                  className="flex flex-row justify-center gap-1"
                  key={`${equipment}`}
                >
                  <span>{equipment.name}</span>
                  <span>{equipment.weight}</span>
                  <span>{equipment.weight_unit}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
