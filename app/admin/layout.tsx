import Header from "@/components/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col app-bg">
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}