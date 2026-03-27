-- Whale analytics tables for TaoPulse
-- Migration: 20260327000000_whale_analytics

-- Daily balance snapshots per whale address
CREATE TABLE IF NOT EXISTS whale_snapshots (
  address         TEXT        NOT NULL,
  date            DATE        NOT NULL,
  balance_total   NUMERIC     NOT NULL DEFAULT 0,
  balance_free    NUMERIC     NOT NULL DEFAULT 0,
  balance_staked  NUMERIC     NOT NULL DEFAULT 0,
  rank            INTEGER,
  PRIMARY KEY (address, date)
);

CREATE INDEX IF NOT EXISTS idx_whale_snapshots_date    ON whale_snapshots (date DESC);
CREATE INDEX IF NOT EXISTS idx_whale_snapshots_address ON whale_snapshots (address);

-- Per-subnet alpha token balances per whale address per day
CREATE TABLE IF NOT EXISTS whale_alpha_balances (
  address         TEXT        NOT NULL,
  date            DATE        NOT NULL,
  netuid          INTEGER     NOT NULL,
  hotkey          TEXT,
  balance_alpha   NUMERIC     NOT NULL DEFAULT 0,
  balance_as_tao  NUMERIC     NOT NULL DEFAULT 0,
  rank            INTEGER,
  PRIMARY KEY (address, date, netuid)
);

CREATE INDEX IF NOT EXISTS idx_whale_alpha_date    ON whale_alpha_balances (date DESC);
CREATE INDEX IF NOT EXISTS idx_whale_alpha_address ON whale_alpha_balances (address);
CREATE INDEX IF NOT EXISTS idx_whale_alpha_netuid  ON whale_alpha_balances (netuid);

-- Whale transfer/transaction history
CREATE TABLE IF NOT EXISTS whale_transactions (
  id                TEXT        PRIMARY KEY,
  address           TEXT        NOT NULL,
  type              TEXT        NOT NULL,
  amount            NUMERIC     NOT NULL DEFAULT 0,
  counterparty      TEXT,
  block_number      INTEGER,
  timestamp         TIMESTAMP,
  transaction_hash  TEXT,
  UNIQUE (address, block_number, transaction_hash)
);

CREATE INDEX IF NOT EXISTS idx_whale_txns_address   ON whale_transactions (address);
CREATE INDEX IF NOT EXISTS idx_whale_txns_timestamp ON whale_transactions (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whale_txns_type      ON whale_transactions (type);

-- Whale delegation/undelegation events
CREATE TABLE IF NOT EXISTS whale_delegations (
  id                   TEXT        PRIMARY KEY,
  address              TEXT        NOT NULL,
  action               TEXT        NOT NULL,   -- 'DELEGATE' | 'UNDELEGATE'
  delegate             TEXT        NOT NULL,   -- hotkey address
  delegate_name        TEXT,
  netuid               INTEGER,
  amount               NUMERIC     NOT NULL DEFAULT 0,
  alpha                NUMERIC,
  usd                  NUMERIC,
  alpha_price_in_tao   NUMERIC,
  alpha_price_in_usd   NUMERIC,
  timestamp            TIMESTAMP,
  block_number         INTEGER,
  UNIQUE (address, block_number, action, delegate, netuid)
);

CREATE INDEX IF NOT EXISTS idx_whale_delegations_address   ON whale_delegations (address);
CREATE INDEX IF NOT EXISTS idx_whale_delegations_timestamp ON whale_delegations (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whale_delegations_action    ON whale_delegations (action);
CREATE INDEX IF NOT EXISTS idx_whale_delegations_delegate  ON whale_delegations (delegate);
