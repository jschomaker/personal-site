import Link from "next/link";

export default function Header() {
  return (
    <header className="relative z-30 flex h-(--header-height) w-full items-center justify-between bg-transparent pl-[max(2rem,env(safe-area-inset-left))] pr-[max(2rem,env(safe-area-inset-right))] motion-safe:animate-intro-fade">
      <Link href="/" className="-m-2 p-2 font-semibold text-lg">
        JS
      </Link>
      {/* Padding grows each tap target to ~44px; negative margins and the
          smaller gap keep the visual spacing identical to before. */}
      <nav className="-my-2.5 -mr-2 flex gap-2">
        <Link href="/" className="px-2 py-2.5 transition-opacity hover:opacity-70">Home</Link>
        <Link href="/blog" className="px-2 py-2.5 transition-opacity hover:opacity-70">Blog</Link>
        <Link href="/projects" className="px-2 py-2.5 transition-opacity hover:opacity-70">Projects</Link>
        <Link href="/about" className="px-2 py-2.5 transition-opacity hover:opacity-70">About</Link>
      </nav>
    </header>
  );
}
