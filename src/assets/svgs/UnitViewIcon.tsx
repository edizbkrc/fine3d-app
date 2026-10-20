import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export default function UnitViewIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 1.5H3C2.175 1.5 1.5 2.175 1.5 3V21C1.5 21.825 2.175 22.5 3 22.5H14.25V21C14.25 18.9 15.9 17.25 18 17.25V15.75C15.075 15.75 12.75 18.075 12.75 21H10.5V18H9V21H3V3H9V13.5H10.5V9.75H13.5V8.25H10.5V3H21V8.25H18V9.75H21V21H18V22.5H21C21.825 22.5 22.5 21.825 22.5 21V3C22.5 2.175 21.825 1.5 21 1.5Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  );
}
