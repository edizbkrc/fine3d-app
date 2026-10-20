export enum Facade {
  None = 0,

  North = 1 << 0,
  South = 1 << 1,
  East = 1 << 2,
  West = 1 << 3,

  NorthEast = North | East,
  NorthWest = North | West,
  SouthEast = South | East,
  SouthWest = South | West,

  All = North | South | East | West,
}
