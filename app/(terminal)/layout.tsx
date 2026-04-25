export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black min-h-screen">
      {children}
    </div>
  );
}