import Link from 'next/link';

export default function Footer({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex justify-center text-sm text-slate-500">
          <span className="mr-1">Dikembangkan oleh</span>
          <Link
            href="https://fathforce.com"
            target="_blank"
            className="font-medium text-slate-700 hover:underline"
          >
            Fathforce
          </Link>
        </div>
      </div>
    </footer>
  );
}
