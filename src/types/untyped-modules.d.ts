// Tip tanımı yayımlamayan paketler. Kullanım yerleri zaten `any` ile çalışıyor; bu bildirim
// olmadan tsc (noImplicitAny) bütün projeyi hatalı sayıyordu.
declare module "crypto-js";
declare module "react-text-mask";
declare module "marzipano";
