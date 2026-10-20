"use client";
import CompassIcon from "@/assets/svgs/CompassIcon";
import OpsIconButton from "@components/OpsIconButton";

export default function DirectionCompass({
  angleDeg = 0,
  isMobile,
  onCompassClick,
}: {
  angleDeg: number;
  isMobile: boolean;
  onCompassClick?: () => void;
}) {
  return (
    <OpsIconButton
      onClick={onCompassClick}
      sx={{
        width: isMobile ? 40 : 48,
        height: isMobile ? 40 : 48,
        borderRadius: "50%",
        transform: `rotate(${angleDeg}deg)`,
        cursor: onCompassClick ? "pointer" : "default",
      }}
    >
      <CompassIcon />
    </OpsIconButton>
  );
}
