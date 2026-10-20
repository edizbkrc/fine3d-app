import Link from "next/link";

export default function LinkWraper({ children, href, style, target }: any) {
  return href ? (
    <Link href={href} prefetch style={style} target={target}>
      {children}
    </Link>
  ) : (
    children
  );
}
