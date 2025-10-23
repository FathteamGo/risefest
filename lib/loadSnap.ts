export function loadSnap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).snap) return resolve();
    const s = document.createElement('script');
    const isProd = String(process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION ?? 'false').toLowerCase() === 'true';
    s.src = isProd ? 'https://app.midtrans.com/snap/snap.js'
                   : 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}