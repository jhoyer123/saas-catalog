import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>LANDINGPAGE</h1>
      <Link href="/auth/login">
        <Button>Iniciar Sesión</Button>
      </Link>
      <Link href="/auth/register">
        <Button variant="outline">Registrarse</Button>
      </Link>
    </div>
  );
}
