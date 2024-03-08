import { useLocation } from "react-router-dom";
import { Routine } from "../typings";
import { useState, useMemo } from "react";
import { Button, Input } from "@nextui-org/react";
import { useDatabaseContext } from "../context/useDatabaseContext";

export default function RoutineDetailsPage() {
  const location = useLocation();
  const state = location.state.routine as Routine;
  const [routine, setRoutine] = useState<Routine>(state);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newRoutineName, setNewRoutineName] = useState<string>(routine.name);
  const [newRoutineNote, setNewRoutineNote] = useState<string>(
    typeof routine.note === "string" ? routine.note : ""
  );
  const { db } = useDatabaseContext();

  const isNewRoutineNameInvalid = useMemo(() => {
    return newRoutineName === null || newRoutineName.trim().length === 0;
  }, [newRoutineName]);

  const updateRoutineNoteAndName = async () => {
    if (isNewRoutineNameInvalid) return;

    try {
      if (db === null) return;

      const noteToInsert: string | null =
        newRoutineNote.trim().length === 0 ? null : newRoutineNote;

      await db.execute(
        "UPDATE routines SET name = $1, note = $2 WHERE id = $3",
        [newRoutineName, noteToInsert, routine.id]
      );

      setRoutine((prev) => ({
        ...prev,
        name: newRoutineName,
        note: newRoutineNote,
      }));

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-[400px]">
      <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
        <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
          {routine.name}
        </h1>
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
            <Button color="success" onPress={updateRoutineNoteAndName}>
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
