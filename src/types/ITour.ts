export interface TourStep {
  target: string;
  content: string;
  title?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
  spotlightPadding?: number;
  offset?: number;
}

export interface TourState {
  run: boolean;
  steps: TourStep[];
  stepIndex: number;
  tourActive: boolean;
}
