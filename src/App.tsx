import "./App.css";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api";

function App() {
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const getGreeting = async () => {
      const msg = await invoke<string>("greet", { name: "Tdfsdfsdst" });

      setGreeting(msg);
    };

    getGreeting();
  }, []);

  return (
    <>
      <div className="text-3xl text-red-500">{greeting}</div>
    </>
  );
}

export default App;
