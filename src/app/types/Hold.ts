export type SUPPORTED_FORMATS = "AO5" | "MO3" | "BO3" | "BO1";

export type SUPPORTED_CUBES =
  | "2x2"
  | "3x3"
  | "4x4"
  | "5x5"
  | "6x6"
  | "7x7"
  | "Pyraminx"
  | "Megaminx"
  | "Skewb"
  | "Square-1"
  | "Clock"
  | "FMC"
  | "3x3 OH"
  | "3x3 BLD";

export type Hold = {
  meeting_id: number;
  cube_name: SUPPORTED_CUBES;
  format: SUPPORTED_FORMATS;
  rounds: number;
};
