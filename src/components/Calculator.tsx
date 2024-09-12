import { useState } from "react";
import {
  BackspaceIcon,
  CrossIcon,
  DivideIcon,
  EqualsIcon,
  MinusIcon,
  PlusIcon,
} from "../assets";

export const Calculator = () => {
  const [result, setResult] = useState<string>("0");
  const [history, setHistory] = useState<string>("");

  const handleClearButton = () => {
    setResult("0");
    setHistory("");
  };

  const handleNumberButton = (num: string) => {
    if (!/[0-9]/.test(num)) return;

    if (result === "0") {
      // Replace 0 with first digit
      setResult(num);
    } else {
      setResult((prev) => prev + num);
    }
  };

  const handleBackspaceButton = () => {
    setResult((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  return (
    <div className="flex flex-col gap-1.5 px-10">
      <div className="flex flex-col items-end p-2 border border-stone-400 rounded-lg">
        <span className="h-6 text-stone-500">{history}</span>
        <span className="h-8 text-3xl font-semibold">{result}</span>
      </div>
      <div className="grid grid-rows-5 grid-cols-4 gap-0.5">
        {["(", ")"].map((bracket) => (
          <button className="h-12 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
            {bracket}
          </button>
        ))}
        <button
          className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleClearButton()}
        >
          C
        </button>
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <DivideIcon size={26} color="#848484" />
        </button>
        {["7", "8", "9"].map((num) => (
          <button
            className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
            onClick={() => handleNumberButton(num)}
          >
            {num}
          </button>
        ))}
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <CrossIcon size={24} color="#848484" />
        </button>
        {["4", "5", "6"].map((num) => (
          <button
            className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
            onClick={() => handleNumberButton(num)}
          >
            {num}
          </button>
        ))}
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <MinusIcon size={36} color="#848484" />
        </button>
        {["1", "2", "3"].map((num) => (
          <button
            className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
            onClick={() => handleNumberButton(num)}
          >
            {num}
          </button>
        ))}
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <PlusIcon size={36} color="#848484" />
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          .
        </button>
        <button
          className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
          onClick={() => handleNumberButton("0")}
        >
          0
        </button>
        <button
          className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleBackspaceButton()}
        >
          <BackspaceIcon size={28} color="#848484" />
        </button>
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <EqualsIcon size={36} color="#848484" />
        </button>
      </div>
    </div>
  );
};
