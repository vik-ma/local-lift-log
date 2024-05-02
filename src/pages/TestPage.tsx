import { useState } from "react";

export default function TestPage() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
        <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
          TEST
        </h1>
      </div>
      <div className="flex flex-col bg-white border border-black overflow-auto mb-20">
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
        Test
        <br />
      </div>
      <div
        className={
          isExpanded
            ? "fixed bottom-0 top-16 bg-red-500 w-[400px]"
            : "fixed bottom-0 bg-red-500 h-20 w-[400px]"
        }
      >
        <button
          className="h-20 w-[400px] cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        ></button>
      </div>
    </div>
  );
}
