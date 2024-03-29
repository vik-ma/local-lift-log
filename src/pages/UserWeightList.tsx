import Database from "tauri-plugin-sql-api";
import { useState, useEffect } from "react";
import { UserWeight } from "../typings";

export default function UserWeightListPage() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Body Weight List
          </h1>
        </div>
      </div>
    </>
  );
}
