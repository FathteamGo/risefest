import Link from 'next/link';

export default function Footer({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <footer className="border-t mt-4 pb-8 mb-4 border-gray-200 items-center">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-1 justify-center text-sm text-gray-600">
          Developed by <Link href="https://fathforce.com" className="text-bold text-gray-900" target='_blank'>Fathforce</Link>
        </div>
      </div>
    </footer>
  );
}
