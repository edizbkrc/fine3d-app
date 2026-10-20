"use client";

import Image from "next/image";
import { Backdrop } from "@mui/material";

export default function Loading() {
  return (
    <Backdrop open>
      <Image
        priority
        width={400}
        height={210}
        src="/favicon-1200x630.png"
        alt="fine 3d loading Logo"
        className="rotating-image"
      />
    </Backdrop>
  );
}
