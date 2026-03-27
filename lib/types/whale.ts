// Supabase table row types for whale analytics

export type WhaleSnapshot = {
  address: string;
  date: string;           // ISO date string YYYY-MM-DD
  balance_total: number;
  balance_free: number;
  balance_staked: number;
  rank: number | null;
};

export type WhaleAlphaBalance = {
  address: string;
  date: string;           // ISO date string YYYY-MM-DD
  netuid: number;
  hotkey: string | null;
  balance_alpha: number;
  balance_as_tao: number;
  rank: number | null;
};

export type WhaleTransaction = {
  id: string;
  address: string;
  type: string;
  amount: number;
  counterparty: string | null;
  block_number: number | null;
  timestamp: string | null; // ISO timestamp
  transaction_hash: string | null;
};

export type WhaleDelegation = {
  id: string;
  address: string;
  action: "DELEGATE" | "UNDELEGATE";
  delegate: string;
  delegate_name: string | null;
  netuid: number | null;
  amount: number;
  alpha: number | null;
  usd: number | null;
  alpha_price_in_tao: number | null;
  alpha_price_in_usd: number | null;
  timestamp: string | null; // ISO timestamp
  block_number: number | null;
};
