import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api";
import { Checkbox, Button } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";

const addRoutine = async () => {
  const databaseUrl: string = import.meta.env.VITE_DATABASE_URL_FULL;

  const db = await Database.load(databaseUrl);

  try {
    const result = await db.execute(
      "INSERT into routines (name, is_schedule_weekly, num_days_in_schedule) VALUES ($1, $2, $3)",
      ["test", true, 7]
    );

    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
};

export default function HomePage() {
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const getGreeting = async () => {
      const msg = await invoke<string>("greet", { name: "Test" });

      setGreeting(msg);
    };

    getGreeting();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            {greeting}
          </h1>
        </div>
        <Checkbox defaultSelected>Option</Checkbox>
        <Button
          className="text-lg"
          size="lg"
          color="primary"
          onClick={addRoutine}
        >
          Test
        </Button>
      </div>
    </>
  );
}
