-- Fix block_number columns to BIGINT
-- Bittensor block numbers are ~7.8M and growing, exceeding INTEGER max (2.1B is fine now
-- but using BIGINT for safety and consistency with nightly scan script types)
--
-- Run this in Supabase Dashboard → SQL Editor
-- Date: 2026-03-28

ALTER TABLE whale_transactions ALTER COLUMN block_number TYPE BIGINT;
ALTER TABLE whale_delegations ALTER COLUMN block_number TYPE BIGINT;
