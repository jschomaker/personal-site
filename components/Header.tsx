import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-30 flex w-full items-center justify-between bg-transparent px-8 py-4">
      <Link href="/" className="font-semibold text-lg">
        JS
      </Link>
      <nav className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
  );
}
