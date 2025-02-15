import { useEffect, useMemo, useState } from "react";
import {
  BackspaceIcon,
  CrossIcon,
  DivideIcon,
  MinusIcon,
  PlusIcon,
} from "../assets";
import { evaluate } from "mathjs";
import { Button } from "@heroui/react";
import { OperatingCalculationItem } from "../typings";

type CalculatorProps = {
  isCalculationInvalid: boolean;
  setIsCalculationInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  buttonAction: (calculationString: string) => void;
  operatingCalculationItem: OperatingCalculationItem | undefined;
};

export const Calculator = ({
  isCalculationInvalid,
  setIsCalculationInvalid,
  buttonAction,
  operatingCalculationItem,
}: CalculatorProps) => {
  const [result, setResult] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [isPointAdded, setIsPointAdded] = useState<boolean>(false);
  const [isOperationActive, setIsOperationActive] = useState<boolean>(false);
  const [numLeftBrackets, setNumLeftBrackets] = useState<number>(0);

  const operationSymbols = useMemo(() => {
    return ["+", "-", "*", "/"];
  }, []);

  const isInputAtLimit = useMemo(() => {
    return input.length >= 36;
  }, [input]);

  const handleClearButton = () => {
    setResult("");
    setInput("");
    setIsPointAdded(false);
    setIsOperationActive(false);
    setNumLeftBrackets(0);
    setIsCalculationInvalid(true);
  };

  const handleNumberButton = (num: string) => {
    if (!/[0-9]/.test(num) || isInputAtLimit) return;

    let existingInput = input;

    if (input.length > 0) {
      const lastSymbol = input.charAt(input.length - 1);
      const secondLastSymbol = input.charAt(input.length - 3);

      if (lastSymbol === "0" && operationSymbols.includes(secondLastSymbol)) {
        existingInput = existingInput.slice(0, -1);
      }
    }

    const newInput = isOperationActive
      ? `${existingInput} ${num}`
      : existingInput + num;

    setInput(newInput);
    if (isOperationActive) setIsOperationActive(false);
  };

  const handleBackspaceButton = () => {
    if (input.length === 0) return;

    const lastSymbol = input.charAt(input.length - 1);

    if (lastSymbol === ".") setIsPointAdded(false);

    if (lastSymbol === "(") setNumLeftBrackets(numLeftBrackets - 1);

    if (lastSymbol === ")") setNumLeftBrackets(numLeftBrackets + 1);

    let newInput = input.length > 0 ? input.slice(0, -1) : "";

    let newLastSymbol = newInput.charAt(newInput.length - 1);

    if (newLastSymbol === " ") {
      newLastSymbol = newInput.charAt(newInput.length - 2);
      newInput = newInput.length > 0 ? newInput.slice(0, -1) : "";
    }

    if (operationSymbols.includes(newLastSymbol)) {
      setIsOperationActive(true);
    } else {
      setIsOperationActive(false);
    }

    setInput(newInput);
  };

  const handlePointButton = () => {
    if (isPointAdded || isInputAtLimit) return;

    let newInput = isOperationActive ? " 0." : input === "" ? "0." : ".";

    if (input.length > 0) {
      const lastSymbol = input.charAt(input.length - 1);

      if (lastSymbol === "(") {
        newInput = "0" + newInput;
      }
    }

    setInput(`${input}${newInput}`);
    setIsPointAdded(true);
    setIsOperationActive(false);
  };

  const handleOperationButton = (symbol: string) => {
    if (
      !operationSymbols.includes(symbol) ||
      input.length === 0 ||
      isInputAtLimit
    )
      return;

    const lastSymbol = input.charAt(input.length - 1);

    if (lastSymbol === "(") return;

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

  const handleLeftBracketButton = () => {
    if (isInputAtLimit) return;

    const newInput = isOperationActive ? " (" : "(";

    setInput(input + newInput);
    setNumLeftBrackets(numLeftBrackets + 1);
    setIsOperationActive(false);
  };

  const handleRightBracketButton = () => {
    if (isOperationActive || numLeftBrackets === 0 || isInputAtLimit) return;

    const lastSymbol = input.charAt(input.length - 1);

    if (lastSymbol === "(") return;

    setInput(input + ")");
    setNumLeftBrackets(numLeftBrackets - 1);
    setIsOperationActive(false);
  };

  useEffect(() => {
    if (/[+\-*/]/.test(input) || /\(.*\)/.test(input)) {
      try {
        let result = "";
        let isInvalid = true;

        const calculation = evaluate(input);

        if (calculation === undefined) {
          result = "";
        } else if (calculation === Infinity) {
          result = "Invalid";
        } else if (calculation <= 0) {
          result = calculation;
        } else {
          isInvalid = false;
          result = calculation;
        }

        setResult(result);
        setIsCalculationInvalid(isInvalid);
      } catch {
        setResult("");
        setIsCalculationInvalid(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  useEffect(() => {
    if (
      operatingCalculationItem !== undefined &&
      operatingCalculationItem.calculationItem.itemType === "calculation"
    ) {
      try {
        const calculation = evaluate(
          operatingCalculationItem.calculationItem.label
        );

        setResult(calculation);
        setInput(operatingCalculationItem.calculationItem.label);
      } catch (error) {
        console.log(error);
      }
    }
  }, [operatingCalculationItem]);

  return (
    <div className="flex flex-col gap-1.5 px-10">
      <div className="flex flex-col p-2 border border-stone-400 rounded-lg">
        <span className="h-6 text-stone-500 w-full truncate text-right">
          {input}
        </span>
        <span
          className={
            isCalculationInvalid
              ? "h-8 text-danger text-3xl font-semibold w-full truncate text-right"
              : "h-8 text-3xl font-semibold w-full truncate text-right"
          }
        >
          {result}
        </span>
      </div>
      <div className="grid grid-rows-5 grid-cols-4 gap-0.5 select-none">
        <button
          className="h-12 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleLeftBracketButton()}
        >
          (
        </button>
        <button
          className="h-12 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleRightBracketButton()}
        >
          )
        </button>
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
          className="h-12 col-span-2 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
          onClick={() => handleNumberButton("0")}
        >
          0
        </button>
        <button
          className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100"
          onClick={() => handlePointButton()}
        >
          .
        </button>
        <button
          className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200"
          onClick={() => handleOperationButton("+")}
        >
          <PlusIcon size={36} color="#848484" />
        </button>
      </div>
      <Button
        className="text-xl font-medium"
        size="lg"
        radius="sm"
        color="primary"
        isDisabled={isCalculationInvalid}
        onPress={() => buttonAction(input)}
      >
        {operatingCalculationItem === undefined
          ? "Add Calculation"
          : "Save Calculation"}
      </Button>
    </div>
  );
};
