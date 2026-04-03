import React from "react";
import { useTranslation } from "react-i18next";

const ScannerSection = ({ scanning, barcodeDetected, onScan, onShowInstructions }) => {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-2xl p-1.5"
      style={{
        background: "linear-gradient(to bottom right, var(--theme-cardBg), var(--theme-border))",
      }}
    >
      <div
        className="rounded-xl p-6 h-full backdrop-blur-sm"
        style={{
          backgroundColor: "var(--theme-cardBg)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2.5 rounded-lg"
                style={{
                  backgroundColor: "var(--theme-cardBg)",
                  border: "1px solid var(--theme-border)",
                }}
              >
                <svg className="w-5 h-5" style={{ color: "var(--theme-font)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--theme-font)" }}>
                  {t("scanBoardingPass")}
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                  {t("fastestMethod")} • {t("seconds", { seconds: 30 })} • {t("recommended")}
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: "var(--theme-cardBg)",
              border: "1px solid var(--theme-border)",
            }}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                scanning
                  ? "bg-blue-500 animate-pulse"
                  : barcodeDetected
                  ? "bg-emerald-500"
                  : "bg-gray-400"
              }`}
            ></div>
            <span
              className={`text-xs whitespace-nowrap font-medium ${
                scanning
                  ? "text-blue-400"
                  : barcodeDetected
                  ? "text-emerald-400"
                  : "text-gray-400"
              }`}
            >
              {scanning
                ? t("scanning")
                : barcodeDetected
                ? t("detected")
                : t("scannerReady")}
            </span>
          </div>
        </div>

        <div className="relative mb-8">
          <div
            className={`relative p-8 rounded-xl border transition-all duration-300 ${
              barcodeDetected
                ? "border-emerald-500/50"
                : scanning
                ? "border-blue-500/50"
                : "border-dashed"
            }`}
            style={{
              backgroundColor:
                barcodeDetected || scanning
                  ? "rgba(0,0,0,0.1)"
                  : "rgba(0,0,0,0.05)",
              borderColor: barcodeDetected
                ? "#10b981"
                : scanning
                ? "#3b82f6"
                : "var(--theme-border)",
            }}
          >
            {scanning && (
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-scan"></div>
              </div>
            )}

            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  barcodeDetected
                    ? "bg-emerald-500/10 animate-pulse"
                    : scanning
                    ? "bg-blue-500/10"
                    : ""
                }`}
                style={
                  !barcodeDetected && !scanning
                    ? {
                        backgroundColor: "rgba(0,0,0,0.05)",
                        border: "1px solid var(--theme-border)",
                      }
                    : {}
                }
              ></div>
              <img
                src="https://img.icons8.com/color/144/barcode-scanner.png"
                alt={t("scanIconAlt")}
                className={`relative z-10 w-16 h-16 transition-all duration-300 filter ${
                  scanning ? "brightness-125 scale-110" : "brightness-110"
                }`}
              />

              {barcodeDetected && (
                <div className="absolute -top-2 -right-2 z-20">
                  <div className="bg-emerald-500 text-white p-2 rounded-full border border-emerald-400/30">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div
                  key={i}
                  className={`h-8 transition-all duration-300 ${
                    scanning ? "animate-pulse" : ""
                  }`}
                  style={{
                    width: `${Math.random() * 16 + 8}px`,
                    backgroundColor: scanning ? "#3b82f6" : "var(--theme-border)",
                    opacity: scanning ? 0.7 : 0.4,
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <h3
              className={`text-lg font-semibold mb-2 transition-colors ${
                barcodeDetected
                  ? "text-emerald-400"
                  : scanning
                  ? "text-blue-400"
                  : ""
              }`}
              style={!barcodeDetected && !scanning ? { color: "var(--theme-font)" } : {}}
            >
              {barcodeDetected
                ? t("boardingPassDetected")
                : scanning
                ? t("scanningInProgress")
                : t("readyToScan")}
            </h3>
            <p className="text-sm" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
              {barcodeDetected
                ? t("processingFlightInfo")
                : t("holdPass")}
            </p>
          </div>
        </div>

        <button
          onClick={onShowInstructions}
          className="mt-4 text-sm font-medium flex items-center gap-2 mx-auto hover:opacity-80 transition-opacity"
          style={{ color: "var(--theme-font)", opacity: 0.8 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {t("howToScanProperly")}
        </button>
      </div>
    </div>
  );
};

export default ScannerSection;