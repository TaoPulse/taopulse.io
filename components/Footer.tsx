import Link from "next/link";

const footerLinks = [
  { href: "/what-is-tao", label: "What is TAO?" },
  { href: "/buy-tao", label: "Buy TAO" },
  { href: "/wallets", label: "Wallets" },
  { href: "/staking", label: "Staking" },
  { href: "/subnets", label: "Subnets" },
  { href: "/news", label: "News" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1a] border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-purple-600 flex items-center justify-center shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 1L14 5V11L8 15L2 11V5L8 1Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="8" r="2" fill="white" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                TAO<span className="text-purple-500">Pulse</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Professional analytics for the Bittensor network. Track subnets,
              validators, and TAO staking performance in real time.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://bittensor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Bittensor.com
                </a>
              </li>
              <li>
                <a
                  href="https://taostats.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  TaoStats
                </a>
              </li>
              <li>
                <a
                  href="https://docs.bittensor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; 2026 TaoPulse.io &mdash; Not financial advice
          </p>
          <p className="text-xs text-gray-600">
            Data sourced from public APIs. All figures are approximate.
          </p>
        </div>
      </div>
    </footer>
  );
}
