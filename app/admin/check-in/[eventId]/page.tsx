'use client';

import * as React from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const QR_DIV_ID = 'admin-checkin-qr-div';
const FILE_SCAN_DIV_ID = 'admin-checkin-file-scan-div';

type THtml5Qrcode = any;

function extractUuid(raw: string): string {
  const s = String(raw).trim();
  const m = s.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/);
  if (m) return m[0];
  if (s.includes('/ticket/')) {
    const parts = s.split('/ticket/');
    return (parts[1] || '').split(/[?#]/)[0].replace(/\/+$/, '') || s;
  }
  return s;
}
function normalizeEventId(id: string | number): string {
  return String(id).split(/[?#]/)[0].replace(/:.+$/, '').trim();
}

type ScanLog = {
  raw: string;
  uuid: string;
  ts: number;
  ok: boolean | null;
  msg: string;
  name?: string;
};

export default function AdminCheckInPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = React.use(params);
  const safeEventId = React.useMemo(() => normalizeEventId(eventId), [eventId]);

  const [judulEvent, setJudulEvent] = React.useState<string>(`Acara ${safeEventId}`);
  const [adminId, setAdminId] = React.useState<number>(0);
  const [adminNama, setAdminNama] = React.useState<string>('');

  const [daftarKamera, setDaftarKamera] = React.useState<{ id: string; label: string }[]>([]);
  const [kameraId, setKameraId] = React.useState<string>('');
  const [jalan, setJalan] = React.useState<boolean>(false);
  const [pause, setPause] = React.useState<boolean>(false);
  const [terakhirScan, setTerakhirScan] = React.useState<number>(0);

  const [log, setLog] = React.useState<ScanLog[]>([]);
  const [sibukSubmit, setSibukSubmit] = React.useState<boolean>(false);
  const [infoTiket, setInfoTiket] = React.useState<any>(null);
  const [errorAtas, setErrorAtas] = React.useState<string>('');

  const QrcodeInstRef = React.useRef<THtml5Qrcode | null>(null);
  const QrcodeClassRef = React.useRef<any>(null);
  const terbaruRef = React.useRef<{ val: string; ts: number }>({ val: '', ts: 0 });
  const startingRef = React.useRef(false);

  const inputFileRef = React.useRef<HTMLInputElement | null>(null);
  const [memilihFile, setMemilihFile] = React.useState(false);
  const [prosesFile, setProsesFile] = React.useState(false);

  const scanConfig = React.useMemo(
    () => ({
      fps: 10,
      qrbox: { width: 280, height: 280 },
      rememberLastUsedCamera: true,
      aspectRatio: 1,
    }),
    []
  );

  React.useEffect(() => {
    let hidup = true;
    (async () => {
      try {
        const mod = await import('html5-qrcode');
        if (!hidup) return;
        QrcodeClassRef.current = mod.Html5Qrcode;

        setAdminId(Number(localStorage.getItem('adminId') || 0));
        setAdminNama(localStorage.getItem('adminName') || '');

        const list = await mod.Html5Qrcode.getCameras();
        if (!hidup) return;
        const cams = (list ?? []).map((c: any) => ({ id: c.id, label: c.label || `Kamera ${c.id}` }));
        setDaftarKamera(cams);
        const last = localStorage.getItem('html5_qrcode_last_used_camera_id') || '';
        const initial = cams.find((c) => c.id === last)?.id || cams[0]?.id || '';
        setKameraId(initial);
      } catch (e: any) {
        console.error('init error', e);
        setErrorAtas('Gagal memuat pemindai. Pastikan akses dari localhost/https & izinkan kamera.');
      }
    })();
    return () => {
      hidup = false;
      (async () => {
        try { if (QrcodeInstRef.current) await QrcodeInstRef.current.stop(); } catch {}
        QrcodeInstRef.current = null;
      })();
    };
  }, []);

  React.useEffect(() => {
    let batal = false;
    (async () => {
      if (!API_BASE || !safeEventId) return;
      const fetchJson = async (url: string) => {
        const r = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
        if (!r.ok) return null;
        return r.json().catch(() => null);
      };
      const a = await fetchJson(`${API_BASE}/events/${safeEventId}`);
      const b = a ?? (await fetchJson(`${API_BASE}/dashboard/events/${safeEventId}`));
      if (!batal && b) setJudulEvent(String(b?.data?.title || b?.title || `Acara ${safeEventId}`));
    })();
    return () => { batal = true; };
  }, [safeEventId]);

  React.useEffect(() => {
    if (!kameraId || jalan || !QrcodeClassRef.current) return;
    void mulaiKamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kameraId, QrcodeClassRef.current]);

  async function tungguDivSiap(): Promise<void> {
    const el = document.getElementById(QR_DIV_ID);
    if (!el) return;
    if (el.clientWidth > 0 && el.clientHeight > 0) return;
    await new Promise<void>((resolve) => {
      const ro = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect;
        if (box && box.width > 0 && box.height > 0) { ro.disconnect(); resolve(); }
      });
      ro.observe(el);
      setTimeout(() => { try { ro.disconnect(); } catch {} resolve(); }, 800);
    });
  }

  const mulaiKamera = React.useCallback(async () => {
    if (!kameraId || !QrcodeClassRef.current || startingRef.current) return;
    try {
      startingRef.current = true;
      setErrorAtas('');
      await tungguDivSiap();

      if (!QrcodeInstRef.current) {
        QrcodeInstRef.current = new QrcodeClassRef.current(QR_DIV_ID, { verbose: false });
      } else {
        try { await QrcodeInstRef.current.stop(); } catch {}
      }

      await QrcodeInstRef.current.start(
        { deviceId: { exact: kameraId } },
        scanConfig,
        async (decodedText: string) => {
          const now = Date.now();
          if (terbaruRef.current.val === decodedText && now - terbaruRef.current.ts < 2500) return;
          terbaruRef.current = { val: decodedText, ts: now };
          setTerakhirScan(now);
          await kirimCheckIn(decodedText);
        },
        () => {}
      );
      setJalan(true);
      setPause(false);
    } catch {
      setErrorAtas('Tidak bisa memulai kamera. Coba ganti kamera / refresh / cek izin.');
      setJalan(false);
      setPause(false);
    } finally {
      startingRef.current = false;
    }
  }, [kameraId, scanConfig]);

  const stopKamera   = React.useCallback(async () => { try { if (QrcodeInstRef.current) await QrcodeInstRef.current.stop(); } catch {} setJalan(false); setPause(false); }, []);
  const pauseKamera  = React.useCallback(async () => { try { if (QrcodeInstRef.current && jalan && !pause) { await QrcodeInstRef.current.pause(true); setPause(true); } } catch {} }, [jalan, pause]);
  const resumeKamera = React.useCallback(async () => { try { if (QrcodeInstRef.current && jalan && pause) { await QrcodeInstRef.current.resume(); setPause(false); } } catch {} }, [jalan, pause]);

  async function kirimCheckIn(raw: string) {
    const uuid = extractUuid(raw);
    const itemAwal: ScanLog = { raw, uuid, ts: Date.now(), ok: null, msg: 'Mencatat…' };
    setLog((prev) => [itemAwal, ...prev].slice(0, 40));

    try {
      setSibukSubmit(true);

      const probe = await fetch(`${API_BASE}/dashboard/ticket-transactions/${uuid}`, {
        headers: { Accept: 'application/json' }, cache: 'no-store',
      });

      if (!probe.ok) {
        const j = await probe.json().catch(() => ({}));
        setLog((prev) => [{ ...itemAwal, ok: false, msg: j?.message || 'Transaksi tidak ditemukan', name: '—' }, ...prev.filter(p => p !== itemAwal)]);
        setInfoTiket(null);
        return;
      }

      if (!adminId) {
        setLog((prev) => [{ ...itemAwal, ok: false, msg: 'Admin belum login. Silakan login ulang.', name: '—' }, ...prev.filter(p => p !== itemAwal)]);
        return;
      }

      const resp = await fetch(`${API_BASE}/dashboard/admin/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ uuid, admin_id: adminId, event_id: safeEventId }), // << gunakan UUID hasil extract
      });

      const json: any = await resp.json().catch(() => ({}));
      const okRaw = resp.ok && json?.success !== false;

      const isAlready = okRaw && /sudah\s+di-?check-?in/i.test(String(json?.message || ''));
      const okForUI   = isAlready ? false : okRaw;
      const msgForUI  = isAlready ? 'Maaf, tiket sudah di-check-in.' : okRaw ? (json?.message || 'Check-in tercatat') : (json?.message || 'Gagal');

      try {
        const d = await fetch(`${API_BASE}/dashboard/ticket-transactions/${uuid}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
        const detail = await d.json().catch(() => undefined);
        const data = detail?.data || null;
        setInfoTiket(data);
        const nama = String(data?.ticket_holder_name || '').trim() || '—';
        setLog((prev) => [{ ...itemAwal, ok: okForUI, msg: msgForUI, name: nama }, ...prev.filter(p => p !== itemAwal)]);
      } catch {
        setInfoTiket(null);
        setLog((prev) => [{ ...itemAwal, ok: okForUI, msg: msgForUI, name: '—' }, ...prev.filter(p => p !== itemAwal)]);
      }

      if (okRaw && !isAlready && 'vibrate' in navigator) { try { (navigator as any).vibrate?.(80); } catch {} }
    } catch (e: any) {
      setLog((prev) => [{ ...itemAwal, ok: false, msg: e?.message || 'Kesalahan jaringan', name: '—' }, ...prev.filter(p => p !== itemAwal)]);
    } finally {
      setSibukSubmit(false);
    }
  }

  async function bukaFilePicker() {
    if (memilihFile || prosesFile) return;
    setMemilihFile(true);
    const perluPause = jalan && !pause;
    if (perluPause) { try { await pauseKamera(); } catch {} }
    if (inputFileRef.current) inputFileRef.current.value = '';
    setTimeout(() => inputFileRef.current?.click(), 0);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setMemilihFile(false); return; }
    setProsesFile(true);

    const perluResume = jalan && pause;
    let fileScanner: THtml5Qrcode | null = null;

    try {
      if (!QrcodeClassRef.current) {
        const mod = await import('html5-qrcode');
        QrcodeClassRef.current = mod.Html5Qrcode;
      }

      let host = document.getElementById(FILE_SCAN_DIV_ID);
      if (!host) {
        host = document.createElement('div');
        host.id = FILE_SCAN_DIV_ID;
        host.style.position = 'fixed';
        host.style.left = '-99999px';
        host.style.top = '-99999px';
        document.body.appendChild(host);
      }

      fileScanner = new QrcodeClassRef.current(FILE_SCAN_DIV_ID, { verbose: false });

      const buatVarian = async (src: File, maxSide = 1600, enhance = false) => {
        const bmp = await createImageBitmap(src);
        const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
        const w = Math.max(1, Math.round(bmp.width * scale));
        const h = Math.max(1, Math.round(bmp.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(bmp, 0, 0, w, h);

        if (enhance) {
          const imgData = ctx.getImageData(0, 0, w, h);
          const d = imgData.data;
          let mn = 255, mx = 0;
          for (let i = 0; i < d.length; i += 4) {
            const g = 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2];
            if (g < mn) mn = g; if (g > mx) mx = g;
          }
          const range = Math.max(1, mx - mn);
          for (let i = 0; i < d.length; i += 4) {
            let r=d[i], g=d[i+1], b=d[i+2];
            const lum = 0.2126*r + 0.7152*g + 0.0722*b;
            const k = ((lum - mn) / range) * 255;
            const f = 0.25;
            d[i]   = Math.max(0, Math.min(255, r + (k - lum) * f));
            d[i+1] = Math.max(0, Math.min(255, g + (k - lum) * f));
            d[i+2] = Math.max(0, Math.min(255, b + (k - lum) * f));
          }
          ctx.putImageData(imgData, 0, 0);
        }

        const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png', 1));
        return new File([blob], 'variant.png', { type: 'image/png' });
      };

      const variants: File[] = [];
      variants.push(file);
      variants.push(await buatVarian(file, 1800, false));
      variants.push(await buatVarian(file, 1200, true));

      let hasil: string | null = null;
      for (const v of variants) {
        try {
          hasil = await fileScanner.scanFile(v, false);
          if (hasil) break;
        } catch {}
      }

      if (!hasil) throw new Error('No QR found');
      await kirimCheckIn(hasil);
    } catch {
      alert('QR tidak terbaca dari gambar.');
    } finally {
      setProsesFile(false);
      setMemilihFile(false);
      try { await fileScanner?.clear(); } catch {}
      if (perluResume) { try { await resumeKamera(); } catch {} }
      if (inputFileRef.current) inputFileRef.current.value = '';
    }
  }

  const formatTanggal = (iso?: string | null) => {
    if (!iso) return '-';
    try { return new Date(iso).toLocaleString('id-ID'); } catch { return iso ?? '-'; }
  };

  return (
    <div className="min-h-[100svh] bg-white">
      <Container className="py-4 sm:py-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold sm:text-2xl">Check-in — {judulEvent}</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Gunakan kamera atau unggah gambar untuk memindai QR Code tiket.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/events`}><Button size="sm" variant="secondary" className="w-full sm:w-auto">Kembali</Button></Link>
            <Link href={`/events/`}><Button size="sm" variant="secondary" className="w-full sm:w-auto">Halaman Publik</Button></Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <Card className="p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold sm:text-lg">Pemindai QR</h2>
              <span className={`text-xs sm:text-sm ${jalan ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {jalan ? (pause ? 'Pause' : 'Aktif') : 'Tidak aktif'}
              </span>
            </div>

            <div id={QR_DIV_ID} className="mb-3 aspect-square w-full rounded-lg border bg-black/5 md:aspect-[4/3]" />

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                className="h-10 w-full rounded-md border px-3 sm:w-auto"
                value={kameraId}
                onChange={(e) => setKameraId(e.target.value)}
                disabled={jalan}
              >
                {daftarKamera.map((c) => (<option key={c.id} value={c.id}>{c.label || c.id}</option>))}
              </select>

              {!jalan ? (
                <Button onClick={mulaiKamera} disabled={!kameraId || startingRef.current} className="w-full sm:w-auto">Mulai Kamera</Button>
              ) : (
                <div className="flex gap-2">
                  {!pause ? (
                    <Button variant="secondary" onClick={pauseKamera} className="w-full sm:w-auto">Pause</Button>
                  ) : (
                    <Button onClick={resumeKamera} className="w-full sm:w-auto">Lanjutkan</Button>
                  )}
                  <Button onClick={stopKamera} className="w-full sm:w-auto">Stop</Button>
                </div>
              )}

              <div className="sm:ml-auto" />

              <input ref={inputFileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              <Button type="button" variant="outline" onClick={bukaFilePicker} disabled={memilihFile || prosesFile} className="w-full sm:w-auto">
                {prosesFile ? 'Memproses…' : 'Scan dari Gambar'}
              </Button>
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">
              Terakhir pemindaian: {terakhirScan ? new Date(terakhirScan).toLocaleTimeString('id-ID') : '-'}
            </p>

            <div className="mt-3 rounded-md border p-3">
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground sm:text-sm">Riwayat Scan</h3>
              <ul className="max-h-56 space-y-2 overflow-auto">
                {log.map((r, i) => (
                  <li key={i} className="border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${r.ok === null ? 'text-gray-500' : r.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {r.ok === null ? '•' : r.ok ? 'BERHASIL' : 'GAGAL'}
                      </span>
                      <span className="text-[11px] text-muted-foreground sm:text-xs">{new Date(r.ts).toLocaleTimeString('id-ID')}</span>
                    </div>
                    <div className="mt-0.5 text-[13px]"><span className="text-muted-foreground">Pemegang: </span><span className="font-medium">{r.name ?? '—'}</span></div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{r.msg}</div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold sm:text-lg">Informasi Tiket</h2>
            </div>

            {!infoTiket ? (
              <div className="grid h-[260px] place-items-center rounded-md border bg-muted/30 sm:h-[300px]">
                <div className="px-4 text-center text-sm text-muted-foreground">Arahkan kamera ke QR Code tiket, atau unggah gambar QR untuk melihat detailnya.</div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <Baris label="Kode Transaksi">{infoTiket.id}</Baris>
                <Baris label="Status Tiket">{infoTiket.status}</Baris>
                <Baris label="Metode Pembayaran">{infoTiket.payment_method}</Baris>
                <Baris label="Status Pembayaran">{infoTiket.payment_status}</Baris>
                <Baris label="Pemegang Tiket">{infoTiket.ticket_holder_name}</Baris>
                <Baris label="Email">{infoTiket.ticket_holder_email}</Baris>
                <Baris label="Telepon">{infoTiket.ticket_holder_phone}</Baris>
                <Baris label="Total">
                  {Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(infoTiket.total_amount || 0))}
                </Baris>

                {(infoTiket.checked_in_at_iso || infoTiket.checked_in_at) ? (
                  <div className="rounded-md bg-emerald-50 p-3 text-emerald-900">
                    <div className="text-sm font-medium">Sudah Check-in</div>
                    <div className="text-sm">Waktu: {formatTanggal(infoTiket.checked_in_at_iso ?? infoTiket.checked_in_at)}</div>
                    <div className="text-sm">
                      Oleh: <b>{infoTiket.checker_name ? infoTiket.checker_name : (infoTiket.checked_in_by ? `Admin #${infoTiket.checked_in_by}` : '-')}</b>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </Card>
        </div>
      </Container>

      <div id={FILE_SCAN_DIV_ID} style={{ position: 'fixed', left: -99999, top: -99999 }} aria-hidden />
    </div>
  );
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-start gap-2 text-sm sm:grid-cols-[160px_1fr]">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{children}</div>
    </div>
  );
}
