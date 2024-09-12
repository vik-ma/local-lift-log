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
  const [result, setResult] = useState<string>("");
  const [history, setHistory] = useState<string>("");

  return (
    <div className="flex flex-col gap-1.5 px-10">
      <div className="flex flex-col items-end p-2 border border-stone-400 rounded-lg">
        <span className="h-6 text-stone-500">{history}</span>
        <span className="h-8 text-3xl font-semibold">{result}</span>
      </div>
      <div className="grid grid-rows-5 grid-cols-4 gap-0.5 ">
        <button className="h-12 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          (
        </button>
        <button className="h-12 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          )
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          C
        </button>
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <DivideIcon size={26} color="#848484" />
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          7
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          8
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          9
        </button>
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <CrossIcon size={24} color="#848484" />
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          4
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          5
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          6
        </button>
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <MinusIcon size={36} color="#848484" />
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          1
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          2
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          3
        </button>
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <PlusIcon size={36} color="#848484" />
        </button>
        <button className="flex pt-0.5 justify-center items-center h-12 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          .
        </button>
        <button className="h-12 pt-0.5 text-default-500 text-2xl font-medium border-2 border-default-300 rounded-lg hover:bg-default-100">
          0
        </button>
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <BackspaceIcon size={28} color="#848484" />
        </button>
        <button className="flex justify-center items-center h-12 border-2 border-default-300 rounded-lg bg-default-100 hover:bg-default-200">
          <EqualsIcon size={36} color="#848484" />
        </button>
      </div>
    </div>
  );
};
