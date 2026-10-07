import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-full place-items-center bg-white px-6 text-center">
      <div>
        <Logo size={28} />
        <p className="mt-10 text-6xl font-extrabold text-brand">404</p>
        <h1 className="mt-3 text-xl font-bold">This page took a detour</h1>
        <p className="mt-1 text-sm text-muted">The link might be broken or the page may not exist in this prototype.</p>
        <Link href="/home" className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-600">
          Go to Home
        </Link>
      </div>
    </div>
  );
}
