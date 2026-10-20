/**
 * Döndürülebilir sahnelerin (bina, dollhouse) bütün karelerini arka planda yükler.
 *
 * Eskiden 120 karenin hepsi sahne açılır açılmaz aynı anda istenirdi (~65 MB, sayfa "load"
 * 18 sn). O istekler ilk görünen kareyle bant genişliği için yarışıyor, sahne değişince de
 * iptal edilmiyordu. Burada:
 *  - yükleme kısa bir gecikme + tarayıcı boşta olunca başlar (ilk kare önce gelsin),
 *  - aynı anda en fazla `concurrency` istek gider,
 *  - sıra başlangıç karesine uzaklıktır (±1, ±2…): döndürürken yakın kareler hazır olur,
 *  - dönen fonksiyon çağrılınca bekleyenler başlatılmaz (sahne/blok değişimi),
 *  - veri tasarrufu ya da 2G/3G bağlantıda hiç başlamaz; sürüklerken yakın kare yüklemesi
 *    (preloadNearbyFrames) zaten devrede.
 */
interface IBackgroundFramePreloadOptions {
  total: number;
  startIndex: number;
  /** Zaten önbellekte ya da adresi olmayan kare atlanır. */
  shouldSkip: (index: number) => boolean;
  /** Kareyi yükler; hata olsa da resolve etmeli ki kuyruk durmasın. */
  load: (index: number) => Promise<void>;
  concurrency?: number;
  delayMs?: number;
}

interface INetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

const isConstrainedConnection = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: INetworkInformation }).connection;
  if (!connection) return false;
  return Boolean(connection.saveData) || ["slow-2g", "2g", "3g"].includes(connection.effectiveType ?? "");
};

/** Başlangıç karesinden dışa doğru: s, s+1, s-1, s+2, s-2… (dairesel). */
export const framesByDistance = (total: number, startIndex: number): number[] => {
  const order: number[] = [];
  if (total <= 0) return order;
  const start = ((startIndex % total) + total) % total;
  order.push(start);
  for (let step = 1; order.length < total; step++) {
    const forward = (start + step) % total;
    const backward = (start - step + total) % total;
    if (!order.includes(forward)) order.push(forward);
    if (order.length < total && !order.includes(backward)) order.push(backward);
  }
  return order;
};

export function preloadFramesInBackground({
  total,
  startIndex,
  shouldSkip,
  load,
  concurrency = 4,
  delayMs = 1200,
}: IBackgroundFramePreloadOptions): () => void {
  let cancelled = false;
  if (total <= 0 || isConstrainedConnection()) return () => undefined;

  const queue = framesByDistance(total, startIndex);

  const worker = async () => {
    while (!cancelled && queue.length > 0) {
      const index = queue.shift() as number;
      if (shouldSkip(index)) continue;
      await load(index);
    }
  };

  const start = () => {
    if (cancelled) return;
    for (let i = 0; i < concurrency; i++) void worker();
  };

  let idleHandle: number | undefined;
  const timer = setTimeout(() => {
    const requestIdle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback;
    if (requestIdle) idleHandle = requestIdle(start, { timeout: 2000 });
    else start();
  }, delayMs);

  return () => {
    cancelled = true;
    clearTimeout(timer);
    const cancelIdle = (window as Window & { cancelIdleCallback?: (handle: number) => void }).cancelIdleCallback;
    if (idleHandle !== undefined && cancelIdle) cancelIdle(idleHandle);
  };
}
