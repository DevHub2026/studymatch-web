export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f1218]" style={{ marginLeft: '256px' }}> {/* Force margin with inline style */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}