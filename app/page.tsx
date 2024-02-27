import Link from "next/link";
import TestGreeting from "./components/TestGreeting";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <TestGreeting />
        <Link href={"/routines"}>Routines</Link>
      </div>
    </main>
  );
}
