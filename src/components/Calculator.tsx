import { useMemo, useState } from "react";
import {
  BackspaceIcon,
  CrossIcon,
  DivideIcon,
  EqualsIcon,
  MinusIcon,
  PlusIcon,
} from "../assets";

export const Calculator = () => {
  const [result, setResult] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [isPointAdded, setIsPointAdded] = useState<boolean>(false);
  const [isOperationActive, setIsOperationActive] = useState<boolean>(false);

  const operationSymbols = useMemo(() => {
    return ["+", "-", "*", "/"];
  }, []);

  const handleClearButton = () => {
    setResult("");
    setInput("");
    setIsPointAdded(false);
    setIsOperationActive(false);
  };

  const handleNumberButton = (num: string) => {
    if (!/[0-9]/.test(num)) return;

    const newInput =
      input === "0" ? num : isOperationActive ? `${input} ${num}` : input + num;

    setInput(newInput);
    if (isOperationActive) setIsOperationActive(false);
  };

  const handleBackspaceButton = () => {
    if (input.length === 0) return;

    const lastSymbol = input.charAt(input.length - 1);

    if (lastSymbol === ".") setIsPointAdded(false);

    let newInput = input.length > 1 ? input.slice(0, -1) : "";

    if (isOperationActive) {
      newInput = newInput.slice(0, -1);
      setIsOperationActive(false);
    } else {
      const newLastSymbol = newInput.charAt(newInput.length - 1);
      if (operationSymbols.includes(newLastSymbol)) setIsOperationActive(true);
    }

    setInput(newInput);
  };

  const handlePointButton = () => {
    if (isPointAdded) return;

    const newInput = isOperationActive ? " 0." : input === "" ? "0." : ".";

    setInput(`${input}${newInput}`);
    setIsPointAdded(true);
    setIsOperationActive(false);
  };

  const handleOperationButton = (symbol: string) => {
    if (!operationSymbols.includes(symbol) || input.length === 0) return;

    const lastSymbol = input.charAt(input.length - 1);

    let newInput = input;

    if (lastSymbol === ".") {
      newInput = input.slice(0, -1);
    }

    if (isOperationActive) {
      const updatedCalculation = input.slice(0, -1) + symbol;
      setInput(updatedCalculation);
      return;
    }

    setInput(`${newInput} ${symbol}`);

    setIsOperationActive(true);
    setIsPointAdded(false);
  };

  return (
    <div className="flex flex-col gap-1.5 px-10">
      <div className="flex flex-col items-end p-2 border border-stone-400 rounded-lg">
        <span className="h-6 text-stone-500">{input}</span>
        <span className="h-8 text-3xl font-semibold">{result}</span>
      </div>
      <div className="grid grid-rows-5 grid-cols-4 gap-0.5 select-none">
        {["(", ")"].map((bracket) => (
          <button
            className="h-12 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
            key={bracket}
          >
            {bracket}
          </button>
        ))}
        <button
          className="h-12 pt-0.5 text-red-400 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleClearButton()}
        >
          C
        </button>
        <button
          className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleBackspaceButton()}
        >
          <BackspaceIcon size={28} color="#848484" />
        </button>
        {["7", "8", "9"].map((num) => (
          <button
            className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
            onClick={() => handleNumberButton(num)}
            key={num}
          >
            {num}
          </button>
        ))}
        <button
          className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleOperationButton("/")}
        >
          <DivideIcon size={26} color="#848484" />
        </button>
        {["4", "5", "6"].map((num) => (
          <button
            className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
            onClick={() => handleNumberButton(num)}
            key={num}
          >
            {num}
          </button>
        ))}
        <button
          className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleOperationButton("*")}
        >
          <CrossIcon size={24} color="#848484" />
        </button>
        {["1", "2", "3"].map((num) => (
          <button
            className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
            onClick={() => handleNumberButton(num)}
            key={num}
          >
            {num}
          </button>
        ))}
        <button
          className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleOperationButton("-")}
        >
          <MinusIcon size={36} color="#848484" />
        </button>
        <button
          className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
          onClick={() => handlePointButton()}
        >
          .
        </button>
        <button
          className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
          onClick={() => handleNumberButton("0")}
        >
          0
        </button>
        <button className="flex justify-center items-center h-12 rounded-lg bg-primary hover:bg-[#ffd76a]">
          <EqualsIcon size={36} color="#fff" />
        </button>
        <button
          className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleOperationButton("+")}
        >
          <PlusIcon size={36} color="#848484" />
        </button>
      </div>
    </div>
  );
};
