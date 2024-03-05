import { useLocation } from "react-router-dom";
import { Routine } from "../typings";

export default function RoutineDetailsPage() {
  const location = useLocation();
  const routine = location.state.routine as Routine;

  return (
    <>
      <div className="bg-neutral-900 px-6 py-4 rounded-xl">
        <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
          {routine.name}
        </h1>
      </div>
    </>
  );
}
