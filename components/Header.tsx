export default function Header() {
  return (
    <header className="w-full px-8 py-4 flex items-center justify-between">
      <a href="/" className="font-semibold text-lg">JS</a>
      <nav className="flex gap-6">
        <a href="/">Home</a>
        <a href="/projects">Projects</a>
        <a href="/about">About</a>
      </nav>
    </header>
  )
}