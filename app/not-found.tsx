import Link from "next/link";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Container className="py-16 text-center">
        <div className="mx-auto max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-6 h-24 w-24 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            />
          </svg>

          <h1 className="text-3xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">
            Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
          </p>

          <Link href="/events">
            <Button size="lg">Kembali ke Daftar Acara</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
