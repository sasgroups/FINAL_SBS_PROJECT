import React, { useState, useRef, useEffect } from "react";

const ManualEntrySection = ({
  flights,
  selectedAirline,
  setSelectedAirline,
  selectedFlightType,
  setSelectedFlightType,
  onManualEntry,
  t,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* close when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const airlines = [...new Set((flights || []).map((f) => f.airline))];

  const selectAirline = (airline) => {
    setSelectedAirline(airline);
    setDropdownOpen(false);
  };

  return (
    <div
      className="rounded-3xl p-px relative group overflow-hidden h-full shadow-2xl"
      style={{
        background: "rgba(71,85,105,0.5)",
      }}
    >
      <div
        className="relative rounded-[23px] p-7 h-full flex flex-col w-full"
        style={{
          backgroundColor: "#1e293b",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 mb-6 border-b pb-5"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="p-3 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            <svg className="w-7 h-7 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white drop-shadow-sm">
              {t("manualEntry")}
            </h2>
            <p className="text-xs mt-0.5 font-medium text-indigo-300 opacity-80">
              {t("alternativeMethod")} • 2 minutes
            </p>
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-between gap-6">
          {/* ── Custom Airline Dropdown ── */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2 pl-1">
              <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
                {t("selectAirline")}
              </label>
              {selectedAirline && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{
                    backgroundColor: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.4)",
                    color: "#6ee7b7",
                  }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  {t("selected")}
                </span>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-300 outline-none font-semibold text-base cursor-pointer text-left"
                style={{
                  color: selectedAirline ? "#ffffff" : "rgba(255,255,255,0.45)",
                  backgroundColor: selectedAirline
                    ? "rgba(99,102,241,0.15)"
                    : "rgba(255,255,255,0.04)",
                  borderColor: selectedAirline
                    ? "rgba(99,102,241,0.6)"
                    : "rgba(255,255,255,0.1)",
                }}
              >
                <span>{selectedAirline || t("chooseAirline")}</span>
                <svg
                  className={`w-5 h-5 text-indigo-300 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div
                  className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: "linear-gradient(160deg, rgba(30,27,75,0.98) 0%, rgba(17,24,39,0.98) 100%)",
                    border: "1px solid rgba(99,102,241,0.35)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
                    backdropFilter: "blur(24px)",
                    maxHeight: 210,
                    overflowY: "auto",
                  }}
                >
                  {airlines.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-white opacity-50 text-center">
                      No airlines available
                    </div>
                  ) : (
                    airlines.map((airline, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectAirline(airline)}
                        className="w-full text-left px-4 py-3 text-base font-medium transition-all duration-150 flex items-center gap-3"
                        style={{
                          color: selectedAirline === airline ? "#a5b4fc" : "rgba(255,255,255,0.85)",
                          backgroundColor:
                            selectedAirline === airline
                              ? "rgba(99,102,241,0.2)"
                              : "transparent",
                          borderBottom:
                            idx < airlines.length - 1
                              ? "1px solid rgba(255,255,255,0.05)"
                              : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedAirline !== airline)
                            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedAirline !== airline)
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {selectedAirline === airline && (
                          <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className={selectedAirline === airline ? "ml-0" : "ml-7"}>{airline}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Flight Type ── */}
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3 pl-1 text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
              {t("flightType")}
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "domestic",      icon: "🏠", labelKey: "domestic",      descKey: "domesticDesc" },
                { value: "international", icon: "🌎", labelKey: "international", descKey: "internationalDesc" },
              ].map((type) => {
                const active = selectedFlightType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedFlightType(type.value)}
                    className="relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2"
                    style={{
                      borderColor: active ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.08)",
                      background: active
                        ? "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)"
                        : "rgba(255,255,255,0.03)",
                      boxShadow: active ? "0 0 20px rgba(99,102,241,0.2)" : "none",
                    }}
                  >
                    <span className="text-4xl">{type.icon}</span>
                    <div className="text-center">
                      <span
                        className="block font-bold text-base"
                        style={{ color: active ? "#a5b4fc" : "rgba(255,255,255,0.85)" }}
                      >
                        {t(type.labelKey)}
                      </span>
                      <span
                        className="text-xs block mt-0.5"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {t(type.descKey)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Continue Button ── */}
          <button
            onClick={onManualEntry}
            disabled={!selectedAirline || !selectedFlightType}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 border"
            style={
              selectedAirline && selectedFlightType
                ? {
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.8) 100%)",
                    borderColor: "rgba(165,180,252,0.4)",
                    color: "#ffffff",
                    boxShadow: "0 0 24px rgba(99,102,241,0.35)",
                  }
                : {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.35)",
                    cursor: "not-allowed",
                  }
            }
          >
            {selectedAirline && selectedFlightType ? (
              <>
                <span>{t("continueToBaggageCheck")}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
                </svg>
                <span>{t("selectAirlineAndType")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualEntrySection;