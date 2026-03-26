import type { Metadata } from "next";
import CalcClient from "./CalcClient";

export const metadata: Metadata = {
  title: "TAO Staking Calculator — TaoPulse Widget",
  robots: { index: false, follow: false },
};

export default function CalculatorEmbed() {
  return <CalcClient />;
}
