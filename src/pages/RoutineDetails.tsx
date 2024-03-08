import { useLocation } from "react-router-dom";
import { Routine } from "../typings";
import { useState, useMemo } from "react";
import { Button, Input } from "@nextui-org/react";

export default function RoutineDetailsPage() {
  const location = useLocation();
  const state = location.state.routine as Routine;
  const [routine, setRoutine] = useState<Routine>(state);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newRoutineName, setNewRoutineName] = useState<string>(routine.name);
  const [newRoutineNote, setNewRoutineNote] = useState<
    string | null | undefined
  >(routine.note);

  const isNewRoutineNameInvalid = useMemo(() => {
    return newRoutineName === null || newRoutineName.trim().length === 0;
  }, [newRoutineName]);

  return (
    <div className="flex flex-col gap-4 w-56">
      <div className="flex justify-center items-center">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl w-fit">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            {routine.name}
          </h1>
        </div>
      </div>
      <div>
        <h2 className="text-xl px-1">
          <span className="font-semibold">Note:</span> {routine.note}
        </h2>
      </div>
      {isEditing ? (
        <div className="flex flex-col justify-center gap-2">
          <Input
            value={newRoutineName}
            isInvalid={isNewRoutineNameInvalid}
            label="Name"
            errorMessage={isNewRoutineNameInvalid && "Name can't be empty"}
            variant="faded"
            onValueChange={(value) => setNewRoutineName(value)}
            isRequired
          />
          <Input
            value={newRoutineNote!}
            label="Note"
            variant="faded"
            onValueChange={(value) => setNewRoutineNote(value)}
          />
          <div className="flex justify-center gap-4">
            <Button color="danger" onPress={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button color="success" onPress={() => {}}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button color="primary" onPress={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}
