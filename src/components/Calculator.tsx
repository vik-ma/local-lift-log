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
  const [result, setResult] = useState<string>("0");
  const [calculation, setCalculation] = useState<string>("");
  const [isPointAdded, setIsPointAdded] = useState<boolean>(false);
  const [isOperationActive, setIsOperationActive] = useState<boolean>(false);

  const operationSymbols = useMemo(() => {
    return ["+", "-", "*", "/"];
  }, []);

  const handleClearButton = () => {
    setResult("0");
    setCalculation("");
    setIsPointAdded(false);
    setIsOperationActive(false);
  };

  const handleNumberButton = (num: string) => {
    if (!/[0-9]/.test(num)) return;

    if (isOperationActive) {
      setResult(num);
      setIsOperationActive(false);
    } else {
      const newResult = result === "0" ? num : result + num;

      setResult(newResult);
    }
  };

  const handleBackspaceButton = () => {
    if (result.length === 0) return;

    const lastSymbol = result.charAt(result.length - 1);

    if (lastSymbol === ".") setIsPointAdded(false);

    setResult((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const handlePointButton = () => {
    if (isPointAdded) return;

    const newResult = isOperationActive ? "0." : result + ".";

    setResult(newResult);
    setIsPointAdded(true);
    setIsOperationActive(false);
  };

  const handleOperationButton = (symbol: string) => {
    if (!operationSymbols.includes(symbol) || result.length === 0) return;

    const lastSymbolRes = result.charAt(result.length - 1);

    let newResult = result;

    if (lastSymbolRes === ".") {
      newResult = result.slice(0, -1);

      setResult(newResult);
    }

    if (isOperationActive) {
      const updatedCalculation = calculation.slice(0, -1) + symbol;
      setCalculation(updatedCalculation);
      return;
    }

    const updatedCalculation =
      calculation.length === 0
        ? `${newResult} ${symbol}`
        : `${calculation} ${newResult} ${symbol}`;

    setCalculation(updatedCalculation);

    setIsOperationActive(true);
    setIsPointAdded(false);
  };

  return (
    <div className="flex flex-col gap-1.5 px-10">
      <div className="flex flex-col items-end p-2 border border-stone-400 rounded-lg">
        <span className="h-6 text-stone-500">{calculation}</span>
        <span className="h-8 text-3xl font-semibold">{result}</span>
      </div>
      <div className="grid grid-rows-5 grid-cols-4 gap-0.5 select-none">
        {["(", ")"].map((bracket) => (
          <button className="h-12 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
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
