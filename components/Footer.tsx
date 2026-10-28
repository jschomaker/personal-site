export default function Footer() {
  return (
    <footer className="w-full pl-[max(2rem,env(safe-area-inset-left))] pr-[max(2rem,env(safe-area-inset-right))] pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex items-center justify-between text-sm text-gray-500">
      <span>© 2025 Jasper Schomaker</span>
      <div className="flex gap-6">
        <a href="https://github.com/jschomaker" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/jasper-schomaker/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="#">Email</a>
      </div>
    </footer>
  )
}
