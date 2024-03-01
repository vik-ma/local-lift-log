import { Button, Input } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useState } from "react";

export default function RoutineListPage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    if (inputValue === "") return;

    navigate(`/routines/${inputValue}`);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Routines
          </h1>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Input
            type="text"
            label="Id"
            placeholder="Enter Routine Id"
            onChange={handleInputChange}
          />
          <Button
            className="text-lg"
            size="lg"
            color="primary"
            onClick={handleButtonClick}
          >
            OK
          </Button>
        </div>
      </div>
    </>
  );
}
