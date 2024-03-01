import { useParams } from "react-router-dom";

export default function RoutineDetailsPage() {
  const { id } = useParams();

  return (
    <>
      <div className="bg-neutral-900 px-6 py-4 rounded-xl">
        <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
          {id}
        </h1>
      </div>
    </>
  );
}
