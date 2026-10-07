import type { ReactNode } from "react";
import { Logo } from "../ui/Logo";

/** Single-column, phone-first layout for the sign-in screens. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-white px-6 pb-8 pt-10">
      <div className="flex justify-center">
        <Logo size={30} />
      </div>
      <div className="mx-auto w-full max-w-sm">{children}</div>
    </div>
  );
}
