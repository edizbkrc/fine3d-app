"use client";
import { Backdrop } from "@mui/material";
import dynamic from "next/dynamic";
import LottieFile from "@/assets/lottie/fine3d.json";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

export default function LoadingComponent({ open }: { open: boolean }) {
  return (
    <Backdrop
      sx={{ zIndex: (theme: any) => theme.zIndex.drawer + 999999 }}
      open={open}
    >
      <Player
        autoplay
        loop
        src={LottieFile}
        style={{ height: "250px", width: "250px" }}
      />
    </Backdrop>
  );
}
