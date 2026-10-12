import type { Rail } from "@/interfaces/rail";

export interface SupportedToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  rails: Rail[];
}
