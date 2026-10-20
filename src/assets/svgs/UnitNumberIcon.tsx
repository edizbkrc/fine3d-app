import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export default function UnitNumberIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg
        width="21"
        height="20"
        viewBox="0 0 21 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.1465 1.28516V17.3411H14.8816L10.3176 18.2578L8.03083 18.7113V7.56666L14.2062 6.33159V6.22545H6.79576V17.3411H1.85547V1.28516H19.1465ZM9.2659 8.58945V17.206L14.2062 16.2122V7.59561L9.2659 8.58945ZM17.9114 16.106V2.52023H3.09054V16.106H5.56069V4.99037H15.4413V16.106H17.9114Z"
          fill="#595856"
        />
      </svg>
    </SvgIcon>
  );
}
