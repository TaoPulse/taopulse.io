/**
 * Affiliate link configuration for TaoPulse
 *
 * HOW TO USE:
 * 1. Sign up for each affiliate program (links below)
 * 2. Replace the placeholder codes with your real affiliate codes
 * 3. Redeploy — links update automatically site-wide
 *
 * AFFILIATE PROGRAMS TO JOIN:
 * - Kraken:  https://www.kraken.com/affiliates  (pay-per-signup + % of fees)
 * - Binance: https://www.binance.com/en/activity/referral  (up to 40% fee share)
 * - Gate.io: https://www.gate.io/referral  (up to 40% fee share)
 * - MEXC:    https://www.mexc.com/referral  (up to 30% kickback)
 * - Ledger:  https://affiliate.ledger.com  (10% commission on hardware sales)
 */

export type AffiliateConfig = {
  url: string;
  hasAffiliate: boolean;
  disclosureNote?: string;
};

/**
 * Set `hasAffiliate: true` and add your code to the URL once you've signed up.
 * While `hasAffiliate: false`, the plain URL is used and no disclosure is shown.
 */
export const AFFILIATE_LINKS: Record<string, AffiliateConfig> = {
  kraken: {
    // After joining: https://www.kraken.com/sign-up?referral=YOUR_CODE
    url: "https://www.kraken.com",
    hasAffiliate: false,
  },
  binance: {
    // After joining: https://www.binance.com/en/register?ref=YOUR_CODE
    url: "https://www.binance.com",
    hasAffiliate: false,
  },
  gateio: {
    // After joining: https://www.gate.io/ref/YOUR_CODE
    url: "https://www.gate.io",
    hasAffiliate: false,
  },
  mexc: {
    // After joining: https://www.mexc.com/register?inviteCode=YOUR_CODE
    url: "https://www.mexc.com",
    hasAffiliate: false,
  },
  ledger: {
    // After joining: https://shop.ledger.com/?r=YOUR_CODE  (via affiliate.ledger.com)
    url: "https://www.ledger.com",
    hasAffiliate: false,
  },
  talisman: {
    // No public affiliate program currently — direct link only
    url: "https://talisman.xyz",
    hasAffiliate: false,
  },
  crucible: {
    // Check https://app.crucible.network for referral program
    url: "https://app.crucible.network",
    hasAffiliate: false,
  },
};

/** Returns true if any configured link has an active affiliate code */
export function hasAnyAffiliate(): boolean {
  return Object.values(AFFILIATE_LINKS).some((v) => v.hasAffiliate);
}
