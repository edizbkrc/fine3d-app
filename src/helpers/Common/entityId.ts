/**
 * Sanal tur id'leri 2^53'ten büyük (ör. 780007655845400576). Düz `JSON.parse` bunları
 * en yakın double'a yuvarlar ve `toString()` 780007655845400600 üretir; bu değer URL'e,
 * paylaşılan linke ve oradan API'ye yanlış id olarak gider.
 *
 * Bu yüzden API yanıtları burada çözülür: güvenli aralığı aşan tam sayılar **string**
 * olarak gelir, diğer her şey `JSON.parse` ile birebir aynıdır. Küçük id'ler (blok, daire,
 * kat…) sayı kalır, mevcut `===` karşılaştırmaları bozulmaz.
 */
export function parseJsonPreservingBigInts(text: string): unknown {
  let out = "";
  let last = 0;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (ch === '"') {
      // String içindeki rakamlara dokunmamak için string'i olduğu gibi atla.
      i++;
      while (i < n && text[i] !== '"') {
        i += text[i] === "\\" ? 2 : 1;
      }
      i++;
      continue;
    }

    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      const start = i;
      i++;
      while (i < n && /[0-9eE.+-]/.test(text[i])) i++;
      const token = text.slice(start, i);
      if (/^-?\d{16,}$/.test(token) && !Number.isSafeInteger(Number(token))) {
        out += text.slice(last, start) + '"' + token + '"';
        last = i;
      }
      continue;
    }

    i++;
  }

  return JSON.parse(last === 0 ? text : out + text.slice(last));
}

/**
 * İki id aynı varlığı mı gösteriyor.
 *
 * Tam eşleşme esastır. Yedek kural eski veri içindir: .NET paneli ve eski Fine3D,
 * poligonların `NavigationId`'sini yuvarlanmış hâliyle (…400600) kaydetti ve bu biçimde
 * linkler paylaşıldı. Yuvarlanmış değer gerçek id'yle aynı double'a düşer; büyük id'lerde
 * bu karşılaştırmaya izin vermek o kayıtları ve linkleri çalışır tutar.
 */
export function isSameEntityId(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): boolean {
  if (a == null || b == null) return false;
  const left = String(a);
  const right = String(b);
  if (left === right) return true;

  if (!/^-?\d+$/.test(left) || !/^-?\d+$/.test(right)) return false;
  const leftNumber = Number(left);
  if (Number.isSafeInteger(leftNumber)) return false;
  return leftNumber === Number(right);
}
