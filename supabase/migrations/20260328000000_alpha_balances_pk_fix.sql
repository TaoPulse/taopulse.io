-- Fix whale_alpha_balances PK to include hotkey column
-- A coldkey can stake to multiple hotkeys on the same subnet, so netuid alone is not unique per (address, date)

ALTER TABLE whale_alpha_balances DROP CONSTRAINT IF EXISTS whale_alpha_balances_pkey;
ALTER TABLE whale_alpha_balances ADD PRIMARY KEY (address, date, netuid, hotkey);
