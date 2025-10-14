import Link from 'next/link';

export default function Footer({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <footer className="border-t mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600">
          <Link href="/page/about" className="hover:text-primary-500">About Us</Link>
          <Link href="/page/tos" className="hover:text-primary-500">Terms & Conditions</Link>
          <Link href="/page/privacy-policy" className="hover:text-primary-500">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
