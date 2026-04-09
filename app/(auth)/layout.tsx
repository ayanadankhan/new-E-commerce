// PURPOSE: Centered auth layout with product logo for sign-in flows.

import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-semibold"
      >
        <Image src="/logo.svg" alt="" width={32} height={32} />
        Nexus Commerce
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
