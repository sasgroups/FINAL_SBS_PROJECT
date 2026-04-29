import React from "react";

const ManualEntrySection = ({
  flights,
  selectedAirline,
  setSelectedAirline,
  selectedFlightType,
  setSelectedFlightType,
  onManualEntry,
  t
}) => {
  return (
    <div
      className="rounded-2xl p-0.5 relative group overflow-hidden h-full border-8 border-slate-800 dark:border-gray-800"
      style={{
        backgroundColor: "var(--theme-cardBg)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div
        className="relative rounded-[14px] p-6 h-full flex flex-col w-full"
        style={{
          backgroundColor: "var(--theme-cardBg)",
        }}
      >
        <div className="flex items-center gap-5 mb-8 border-b pb-6" style={{ borderColor: 'var(--theme-border)' }}>
          <div
            className="p-3 rounded-2xl shadow-sm flex items-center justify-center relative"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
              {t("manualEntry")}
            </h2>
            <p className="text-base mt-1 font-medium text-white opacity-70">
              {t("alternativeMethod")} • 2 minutes
            </p>
          </div>
        </div>

        <div className="space-y-8 flex-grow flex flex-col justify-center">
          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col relative group/airline">
              <div className="flex items-center justify-between mb-3 pl-2">
                <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                  {t("selectAirline")}
                </label>
                {selectedAirline && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center gap-1.5 backdrop-blur-sm shadow-sm" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    {t("selected")}
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className={`w-full p-4.5 pl-5 py-4 rounded-2xl border transition-all duration-300 outline-none appearance-none font-semibold text-xl cursor-pointer shadow-inner ${
                    selectedAirline ? "border-white focus:border-white" : "hover:border-gray-400"
                  }`}
                  style={{
                    color: "#ffffffff",
                    backgroundColor: selectedAirline ? "rgba(255, 255, 255, 0.1)" : "var(--theme-bg)",
                    borderColor: selectedAirline ? "#ffffff" : "var(--theme-border)",
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1.2rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.8em 1.8em',
                    paddingRight: '3rem',
                  }}
                >
                  <option value="" style={{ color: "#ffffff", backgroundColor: "var(--theme-cardBg)" }}>
                    {t("chooseAirline")}
                  </option>
                  {[...new Set(flights.map((f) => f.airline))].map((airline, idx) => (
                    <option key={idx} value={airline} style={{ color: "#ffffff", backgroundColor: "var(--theme-cardBg)", padding: '10px' }}>
                      {airline}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-3 pl-2 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                {t("flightType")}
              </label>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { value: "domestic", icon: "🏠", labelKey: "domestic", descKey: "domesticDesc" },
                  { value: "international", icon: "🌎", labelKey: "international", descKey: "internationalDesc" }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedFlightType(type.value)}
                    className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 group`}
                    style={{
                      borderColor: selectedFlightType === type.value ? "#ffffff" : "var(--theme-border)",
                      backgroundColor: selectedFlightType === type.value ? "rgba(255, 255, 255, 0.1)" : "var(--theme-bg)",
                    }}
                  >
                    <span className={`text-5xl transition-transform duration-300 ${selectedFlightType === type.value ? 'opacity-100' : 'opacity-80'}`}>
                      {type.icon}
                    </span>
                    <div className="text-center relative z-10 mt-1">
                       <span className={`block font-bold text-xl mb-1 ${selectedFlightType === type.value ? 'text-white' : ''}`} style={selectedFlightType !== type.value ? { color: "#ffffff" } : {}}>
                        {t(type.labelKey)}
                      </span>
                      <span className={`text-sm font-medium block transition-opacity ${selectedFlightType === type.value ? 'opacity-90' : 'opacity-60'} text-white`}>
                        {t(type.descKey)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
                    <div className="pt-10 w-full mt-auto flex justify-center">
            <button
              onClick={onManualEntry}
              disabled={!selectedAirline || !selectedFlightType}
              className={`relative w-fit py-5 px-8 rounded-2xl font-bold text-xl overflow-hidden transition-all duration-300 border ${
                selectedAirline && selectedFlightType
                  ? "shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:brightness-110"
                  : "cursor-not-allowed opacity-60"
              }`}
              style={{
                backgroundColor: "var(--theme-border)",
                borderColor: selectedAirline && selectedFlightType ? "#ffffff" : "var(--theme-border)",
                color: "#ffffff"
              }}
            >
              <div className="relative z-10 flex items-center justify-center gap-3 whitespace-nowrap">
                {selectedAirline && selectedFlightType ? (
                  <>
                    <span>{t("continueToBaggageCheck")}</span>
                    <svg className="w-7 h-7 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                ) : (
                  <>
                    <svg className="w-7 h-7 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"></path></svg>
                    <span>{t("selectAirlineAndType")}</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ManualEntrySection;