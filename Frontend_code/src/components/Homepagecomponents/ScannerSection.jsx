import React from "react";
import { useTranslation } from "react-i18next";

const ScannerSection = ({ scanning, barcodeDetected, onScan, onShowInstructions }) => {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-2xl p-0.5 relative group overflow-hidden h-full border-8 solid border-slate-800 dark:border-gray-800"
      style={{
        backgroundColor: "var(--theme-cardBg)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div
        className="relative rounded-[14px] p-6 h-full flex flex-col items-center text-center w-full"
        style={{
          backgroundColor: "var(--theme-cardBg)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 w-full">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-2xl shadow-sm flex items-center justify-center relative"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    d="M4 7V5a1 1 0 011-1h2M4 17v2a1 1 0 001 1h2M20 7V5a1 1 0 00-1-1h-2M20 17v2a1 1 0 01-1 1h-2M7 12h10M7 16h6M7 8h4" />
                </svg>
              </div>
              <div className="text-left mt-2">
                <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-1 drop-shadow-sm">
                  {t("scanBoardingPass")}
                </h2>
                <p className="text-sm font-medium text-white opacity-80">
                  {t("fastestMethod")} • {t("seconds", { seconds: 30 })}
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm backdrop-blur-md"
              style={{
                backgroundColor: "var(--theme-cardBg)",
                borderColor: barcodeDetected ? "rgba(16,185,129,0.4)" : scanning ? "rgba(59,130,246,0.4)" : "var(--theme-border)",
              }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${scanning
                    ? "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    : barcodeDetected
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : "bg-gray-400"
                  }`}
              ></div>
              <span
                className={`text-sm whitespace-nowrap font-bold ${scanning
                    ? "text-blue-500"
                    : barcodeDetected
                      ? "text-emerald-500"
                      : ""
                  }`}
                style={!scanning && !barcodeDetected ? { color: "#ffffff", opacity: 0.7 } : {}}
              >
                {scanning
                  ? t("scanning")
                  : barcodeDetected
                    ? t("detected")
                    : t("scannerReady")}
              </span>
            </div>
          </div>
        </div>

        {/* Scanner Illustration */}
        <div className="relative w-36 h-36 mx-auto mb-4 cursor-pointer flex items-center justify-center group/scanner" onClick={onScan}>
          <div
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 shadow-md ${barcodeDetected
                ? "border-emerald-500 bg-emerald-50/10"
                : scanning
                  ? "border-blue-500 bg-blue-50/10"
                  : "border-dashed hover:border-blue-400"
              }`}
            style={!barcodeDetected && !scanning ? { backgroundColor: "transparent", borderColor: "var(--theme-border)" } : {}}
          >
            <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
              <img
                src="https://img.icons8.com/color/256/barcode-scanner.png"
                alt={t("scanIconAlt") || "Scanner Icon"}
                className={`relative z-10 w-12 h-12 object-contain transition-all duration-300 ${scanning ? "brightness-110" : barcodeDetected ? "brightness-100" : "opacity-80 grayscale-[0.2]"
                  }`}
              />
            </div>
          </div>
        </div>

        <div className="mt-2 text-center ">
          <p className="text-lg font-medium text-white opacity-80">
            {barcodeDetected
              ? t("processingFlightInfo") || "Processing flight info..."
              : t("holdPass")}
          </p>
        </div>

        <button
          onClick={onShowInstructions}
          className="mt-6 px-6 py-3.5 rounded-2xl text-md font-bold flex items-center justify-center w-fit gap-2 transition-colors border shadow-sm hover:shadow-md"
          style={{
            color: "#ffffff",
            backgroundColor: "var(--theme-border)",
            borderColor: "var(--theme-border)"
          }}
        >
          <svg className="w-6 h-6 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("howToScanProperly")}
        </button>
      </div>
    </div>
  );
};

export default ScannerSection;