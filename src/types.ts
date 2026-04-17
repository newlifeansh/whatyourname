export type Gender = "male" | "female";

export interface SajuInput {
  gender: Gender | null;
  birthDate: string; // YYYYMMDD
  birthTime: string | null; // HHMM, null = 모름
}
