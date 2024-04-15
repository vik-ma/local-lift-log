import { useState } from "react";
import { LoadingSpinner } from "../components";

export default function UserMeasurementList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  return (
    <>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
              <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
                User Measurements
              </h1>
            </div>
          </>
        )}
      </div>
    </>
  );
}
