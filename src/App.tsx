import "./App.css";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api";

function App() {
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
      <div className="bg-neutral-900 px-6 py-4 rounded rounded-xl">
        <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
          {greeting}
        </h1>
      </div>
    </>
  );
}

export default App;
