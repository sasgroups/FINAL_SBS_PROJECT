import React from "react";
import { useTranslation } from "react-i18next";

const STYLES = `
  @keyframes scanDown {
    0%   { top: 4px;  }
    100% { top: calc(100% - 4px); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(0.97); opacity: 0.45; }
    50%  { transform: scale(1.04); opacity: 0.1;  }
    100% { transform: scale(0.97); opacity: 0.45; }
  }
  @keyframes cornerGlow {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 1;    }
  }
  @keyframes successPop {
    0%   { transform: scale(0.75); opacity: 0; }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes detectRipple {
    0%   { transform: scale(0.9); opacity: 0.7; }
    100% { transform: scale(1.6); opacity: 0;   }
  }

  .scan-line-bar { animation: scanDown 1.6s linear infinite alternate; }
  .pulse-ring    { animation: pulseRing 2.6s ease-in-out infinite; }
  .corner-glow   { animation: cornerGlow 2.4s ease-in-out infinite; }
  .success-pop   { animation: successPop 0.4s ease-out forwards; }
  .detect-ripple { animation: detectRipple 0.9s ease-out forwards; }
`;

/* clean white SVG barcode (no external image) */
const BarcodeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* barcode bars */}
    <rect x="4"  y="4"  width="5"  height="52" rx="1.5" fill="currentColor" />
    <rect x="13" y="4"  width="2"  height="52" rx="1"   fill="currentColor" />
    <rect x="19" y="4"  width="5"  height="52" rx="1.5" fill="currentColor" />
    <rect x="28" y="4"  width="3"  height="52" rx="1"   fill="currentColor" />
    <rect x="35" y="4"  width="7"  height="52" rx="1.5" fill="currentColor" />
    <rect x="46" y="4"  width="2"  height="52" rx="1"   fill="currentColor" />
    <rect x="52" y="4"  width="5"  height="52" rx="1.5" fill="currentColor" />
    <rect x="61" y="4"  width="3"  height="52" rx="1"   fill="currentColor" />
    <rect x="68" y="4"  width="8"  height="52" rx="1.5" fill="currentColor" />
  </svg>
);

const ScannerSection = ({ scanning, barcodeDetected, onScan, onShowInstructions }) => {
  const { t } = useTranslation();

  const cornerColor = barcodeDetected
    ? "#10b981"
    : "#60a5fa";

  const laserColor = scanning
    ? "linear-gradient(90deg, transparent, #3b82f6 15%, #93c5fd 50%, #3b82f6 85%, transparent)"
    : "linear-gradient(90deg, transparent, #818cf8 15%, #c7d2fe 50%, #818cf8 85%, transparent)";

  const laserShadow = scanning
    ? "0 0 8px 3px rgba(59,130,246,0.75)"
    : "0 0 8px 3px rgba(129,140,248,0.65)";

  return (
    <>
      <style>{STYLES}</style>

      <div
        className="rounded-3xl p-px relative overflow-hidden h-full shadow-2xl"
        style={{
          background: barcodeDetected
            ? "rgba(16,185,129,0.4)"
            : "rgba(100,116,139,0.4)",
          transition: "background 0.6s ease",
        }}
      >
        <div
          className="relative rounded-[23px] p-6 h-full flex flex-col items-center justify-center text-center w-full gap-4"
          style={{
            backgroundColor: "#1e293b",
          }}
        >
          {/* ── Header ── */}
          <div className="flex flex-col items-center w-full">
            <div
              className="p-3 rounded-2xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  d="M4 7V5a1 1 0 011-1h2M4 17v2a1 1 0 001 1h2M20 7V5a1 1 0 00-1-1h-2M20 17v2a1 1 0 01-1 1h-2M7 12h10M7 16h6M7 8h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1 drop-shadow-sm">
              {t("scanBoardingPass")}
            </h2>
            <p className="text-xs font-medium text-white opacity-70">
              {t("fastestMethod")} • {t("seconds", { seconds: 30 })}
            </p>
          </div>

          {/* ── Scanner Viewport ── */}
          <div
            className="relative cursor-pointer select-none flex-shrink-0"
            style={{ width: 164, height: 164 }}
            onClick={onScan}
          >
            {/* Outer pulse ring */}
            <div
              className="pulse-ring absolute inset-0 pointer-events-none"
              style={{
                border: `2px solid ${barcodeDetected ? "rgba(16,185,129,0.55)" : "rgba(99,179,237,0.38)"}`,
                borderRadius: 26,
              }}
            />

            {/* Success ripple burst */}
            {barcodeDetected && (
              <div
                className="detect-ripple absolute inset-0 pointer-events-none"
                style={{ border: "2px solid rgba(16,185,129,0.85)", borderRadius: 26 }}
              />
            )}

            {/* Inner scanner box */}
            <div
              className="absolute inset-2 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-500"
              style={{
                border: `2px solid ${barcodeDetected ? "#10b981" : scanning ? "#3b82f6" : "rgba(255,255,255,0.18)"}`,
                backgroundColor: barcodeDetected
                  ? "rgba(16,185,129,0.07)"
                  : "rgba(255,255,255,0.02)",
              }}
            >
              {/* ── Laser scan line: top → bottom → top ── */}
              {!barcodeDetected && (
                <div
                  className="scan-line-bar absolute left-2 right-2 pointer-events-none"
                  style={{
                    height: 3,
                    borderRadius: 4,
                    background: laserColor,
                    boxShadow: laserShadow,
                    zIndex: 20,
                  }}
                />
              )}

              {/* White barcode SVG icon */}
              <BarcodeIcon
                className={`relative z-10 transition-all duration-300 ${
                  barcodeDetected
                    ? "success-pop text-emerald-400"
                    : scanning
                    ? "text-blue-300 opacity-90"
                    : "text-white opacity-60"
                }`}
                style={{ width: 64, height: 48 }}
              />
            </div>

            {/* Corner bracket marks */}
            {[
              [true,  true ],
              [true,  false],
              [false, true ],
              [false, false],
            ].map(([isTop, isLeft], i) => (
              <div
                key={i}
                className="corner-glow absolute"
                style={{
                  top:    isTop  ? 0 : "auto",
                  bottom: isTop  ? "auto" : 0,
                  left:   isLeft ? 0 : "auto",
                  right:  isLeft ? "auto" : 0,
                  width: 22, height: 22,
                  zIndex: 10,
                }}
              >
                {/* horizontal arm */}
                <div style={{
                  position: "absolute",
                  [isTop ? "top" : "bottom"]: 0,
                  [isLeft ? "left" : "right"]: 0,
                  width: 18, height: 3,
                  backgroundColor: cornerColor,
                  borderRadius: 2,
                  boxShadow: `0 0 6px ${cornerColor}`,
                  transition: "background-color .4s",
                }} />
                {/* vertical arm */}
                <div style={{
                  position: "absolute",
                  [isTop ? "top" : "bottom"]: 0,
                  [isLeft ? "left" : "right"]: 0,
                  width: 3, height: 18,
                  backgroundColor: cornerColor,
                  borderRadius: 2,
                  boxShadow: `0 0 6px ${cornerColor}`,
                  transition: "background-color .4s",
                }} />
              </div>
            ))}
          </div>

          {/* Status text */}
          <p className="text-base font-semibold text-white opacity-90 text-center leading-snug">
            {barcodeDetected
              ? t("processingFlightInfo") || "Processing flight info…"
              : t("holdPass")}
          </p>

          {/* How-to button */}
          <button
            onClick={onShowInstructions}
            className="px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center w-fit gap-2 transition-all border shadow-sm hover:brightness-110"
            style={{
              color: "#ffffff",
              backgroundColor: "var(--theme-border)",
              borderColor: "var(--theme-border)",
            }}
          >
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("howToScanProperly")}
          </button>
        </div>
      </div>
    </>
  );
};

export default ScannerSection;