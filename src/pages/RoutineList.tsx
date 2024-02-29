import { Button, Input } from "@nextui-org/react";

export default function RoutineListPage() {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Routines
          </h1>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Input type="text" label="Id" placeholder="Enter Routine Id" />
          <Button className="text-lg" size="lg" color="primary">
            OK
          </Button>
        </div>
      </div>
    </>
  );
}
