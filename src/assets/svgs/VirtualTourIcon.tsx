import React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

const VirtualTourIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2,2"
      />
      <circle
        cx="12"
        cy="12"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M8 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"
        fill="currentColor"
      />
      <path
        d="M12 8c-2.21 0-4 1.79-4 4 0 .74.21 1.43.57 2.02L12 16l3.43-1.98c.36-.59.57-1.28.57-2.02 0-2.21-1.79-4-4-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M4 12c0-1.5.4-2.9 1.1-4.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M19.9 16.1c-.7 1.2-1.7 2.2-2.9 2.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 12c0 1.5-.4 2.9-1.1 4.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.1 7.9c.7-1.2 1.7-2.2 2.9-2.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};

export default VirtualTourIcon;
