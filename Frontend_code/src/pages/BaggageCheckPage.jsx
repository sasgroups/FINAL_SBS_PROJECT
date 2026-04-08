import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Timmer from "../components/Timmer";
import { useTranslation } from "react-i18next";
import AdBanner from "./AdBanner";
import Language from "../components/Language";

const API_URL = process.env.REACT_APP_API_URL;
const API_URL2 = process.env.REACT_APP_API_URL_KIOSK;
const API_URL3 = process.env.REACT_APP_API_URL_Camera;

export default function BaggageCheckPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { baggageData = {} } = location.state || {};

  const [currentWeight, setCurrentWeight] = useState(0);
  const [volume, setVolume] = useState(0);
  const [dimensions, setDimensions] = useState({
    height: 0,
    width: 0,
    length: 0,
  });
  const [objectDetected, setObjectDetected] = useState(false);
  const [noBagTimeout, setNoBagTimeout] = useState(false);
  const [weightStable, setWeightStable] = useState(false);
  const { airline = "", flightType = "", origin, destination } = baggageData;
  const [limits, setLimits] = useState(() => {
    if (baggageData?.maxWeight && baggageData?.maxVolume) {
      return { maxWeight: baggageData.maxWeight, maxVolume: baggageData.maxVolume };
    }
    return { maxWeight: null, maxVolume: null };
  });
  const [isLoadingLimits, setIsLoadingLimits] = useState(() => !(baggageData?.maxWeight && baggageData?.maxVolume));

  const { t } = useTranslation();

  const isLoadingVolume = currentWeight > 0.1 && (!objectDetected || volume === 0);
  const isReady = currentWeight > 0.1 && objectDetected && volume > 0;

  // Status functions with custom yellow thresholds
  const getWeightStatus = (value, limit) => {
    if (value <= 0) return "gray";
    const diff = value - limit;
    if (diff <= 0) return "green";
    if (diff > 0 && diff <= 1) return "yellow";
    return "red";
  };

  const getVolumeStatus = (value, limit) => {
    if (value <= 0) return "gray";
    const diff = value - limit;
    if (diff <= 0) return "green";
    if (diff > 0 && diff <= 5) return "yellow";
    return "red";
  };

  const handleCompleteCheck = async () => {
    if (!isReady) {
      alert(t("noBaggageDetectedAlert") || "Please place baggage on the scale");
      return;
    }

    const payload = {
      airline,
      flightType,
      origin,
      destination,
      weight: currentWeight,
      height: dimensions.height,
      width: dimensions.width,
      length: dimensions.length,
      volume,
      status: {
        weight: currentWeight <= limits.maxWeight ? "ok" : "over",
        volume: volume <= limits.maxVolume ? "ok" : "over",
      },
    };

    console.log("📦 Sending baggage data:", payload);

    try {
      const res = await fetch(`${API_URL}/api/baggage/save-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save check");
      const data = await res.json();
      console.log("✅ Backend response:", data);
      navigate("/ad_player");
    } catch (err) {
      console.error("❌ Failed to save baggage check:", err.message);
      alert("❌ Failed to save baggage check!");
    }
  };

  // Fetch weight every 1s with stability check
  useEffect(() => {
    let stableCount = 0;
    let previousWeight = 0;

    const fetchWeight = async () => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 900); // Prevent overlapping 1s intervals
      try {
        const res = await fetch(`${API_URL2}/api/weight`, { signal: abortController.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("Fetch failed");
        
        const data = await res.json();
        if (data?.weight !== undefined) {
          const newWeight = data.weight;
          setCurrentWeight(newWeight);

          if (Math.abs(newWeight - previousWeight) < 0.1) {
            stableCount++;
            if (stableCount >= 3 && newWeight > 0.1) {
              setWeightStable(true);
            }
          } else {
            stableCount = 0;
            setWeightStable(false);
          }
          previousWeight = newWeight;
        }
      } catch (err) {
        // Silent catch unless relevant, prevents log spamming
      }
    };

    fetchWeight();
    const interval = setInterval(fetchWeight, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch object/dimensions every 5s
  useEffect(() => {
    let timeoutId;

    const fetchObject = async () => {
      const abortController = new AbortController();
      const timeoutIdFetch = setTimeout(() => abortController.abort(), 4500);
      try {
        const res = await fetch(`${API_URL3}/api/detection`, { signal: abortController.signal });
        clearTimeout(timeoutIdFetch);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        
        if (data?.detected && weightStable && currentWeight > 0.1) {
          clearTimeout(timeoutId);
          setDimensions({
            height: data.height_cm,
            width: data.width_cm,
            length: data.length_cm,
          });
          const totalLinearCm = data.height_cm + data.width_cm + data.length_cm;
          setVolume(Math.round(totalLinearCm));
          setObjectDetected(true);
          setNoBagTimeout(false);
        } else {
          setDimensions({ height: 0, width: 0, length: 0 });
          setVolume(0);
          setObjectDetected(false);

          timeoutId = setTimeout(() => setNoBagTimeout(true), 1500);
        }
      } catch (err) {
        // Silent catch
      }
    };

    fetchObject();
    const interval = setInterval(fetchObject, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [currentWeight, weightStable]);

  // Fetch airline limits with loading state
  useEffect(() => {
    const fetchLimits = async () => {
      // Return early since limits are already seeded synchronously from route state.
      if (baggageData.maxWeight && baggageData.maxVolume) {
        return;
      }
      
      setIsLoadingLimits(true);
      try {
        if (airline && flightType) {
          const cacheBust = Math.floor(Date.now() / 300000); // 5 min cache
          const res = await fetch(`${API_URL}/api/flights?t=${cacheBust}`);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          
          const match = data.find((f) => f.airline === airline);
          if (match) {
            setLimits({
              maxWeight: flightType === "Domestic" ? match.max_weight_domestic : match.max_weight_international,
              maxVolume: flightType === "Domestic" ? match.max_volume_domestic : match.max_volume_international,
            });
          } else {
            setLimits({ maxWeight: null, maxVolume: null });
          }
        } else {
          setLimits({ maxWeight: null, maxVolume: null });
        }
      } catch (err) {
        setLimits({ maxWeight: null, maxVolume: null });
      } finally {
        setIsLoadingLimits(false);
      }
    };

    fetchLimits();
  }, [airline, flightType, baggageData]);

  const weightLimit = parseFloat(limits.maxWeight) || 0;
  const volumeLimit = parseFloat(limits.maxVolume) || 0;

  const weightStatus = getWeightStatus(currentWeight, weightLimit);
  const volumeStatus = getVolumeStatus(volume, volumeLimit);

  const statusColors = {
    gray: {
      bg: "rgba(0, 0, 0, 0.05)",
      border: "var(--theme-border)",
      text: "rgba(0, 0, 0, 0.5)",
      icon: "⚪",
    },
    green: {
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.3)",
      text: "#10b981",
      icon: "✅",
    },
    yellow: {
      bg: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.3)",
      text: "#f59e0b",
      icon: "⚠️",
    },
    red: {
      bg: "rgba(239, 68, 68, 0.1)",
      border: "rgba(239, 68, 68, 0.3)",
      text: "#ef4444",
      icon: "❌",
    },
  };

  if (isLoadingLimits) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--theme-bg)" }}
      >
        <div
          className="rounded-xl p-8 shadow-lg max-w-md text-center"
          style={{
            backgroundColor: "var(--theme-cardBg)",
            border: `1px solid var(--theme-border)`,
          }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4"
            style={{ borderColor: "var(--theme-border)", borderTopColor: "transparent" }}></div>
          <p style={{ color: "var(--theme-font)" }}>Loading airline limits...</p>
        </div>
      </div>
    );
  }

  if (!limits.maxWeight || !limits.maxVolume) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--theme-bg)" }}
      >
        <div
          className="rounded-xl p-8 shadow-lg max-w-md text-center"
          style={{
            backgroundColor: "var(--theme-cardBg)",
            border: `1px solid var(--theme-border)`,
          }}
        >
          <h1 className="text-2xl font-bold text-red-400 mb-3">
            ❌ {t("missingData")}
          </h1>
          <p className="mb-6" style={{ color: "var(--theme-font)" }}>
            {t("missingDataDesc")}
          </p>
          <button
            className="px-6 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--theme-cardBg)",
              border: `1px solid var(--theme-border)`,
              color: "var(--theme-font)",
            }}
            onClick={() => navigate(-1)}
          >
            {t("goBack")}
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--theme-bg)" }}
    >
      {/* Top Ad */}
      <div style={{ height: "50vh" }}>
        <AdBanner height="100%" />
      </div>

      {/* Bottom Content */}
      <div className="h-full overflow-y-auto px-4" style={{ height: "50vh" }}>
        <Timmer />
        <div className="w-full">
          <Language />
        </div>

        <div
          className="rounded-xl p-8 shadow-lg w-full max-w-7xl flex flex-col gap-6 text-center m-10 mx-auto backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            border: `1px solid var(--theme-border)`,
            color: "var(--theme-font)",
          }}
        >
          {currentWeight <= 0.1 ? (
            /* ----- No baggage at all ----- */
            <div
              className="flex flex-col items-center justify-center gap-4 py-20 rounded-xl"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                border: `1px solid var(--theme-border)`,
                color: "var(--theme-font)",
              }}
            >
              <span className="text-6xl mb-2">🛄</span>
              <p className="text-2xl" style={{ color: "var(--theme-font)" }}>
                {t("No Baggage Detected")}
              </p>
              <p className="text-lg" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                {t("Please place your baggage on the scale")}
              </p>
              <div
                className="mt-4 p-4 rounded-lg"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
              >
                <p className="text-sm" style={{ color: "var(--theme-font)", opacity: 0.6 }}>
                  Current reading: Weight = {currentWeight.toFixed(2)} kg
                </p>
              </div>
            </div>
          ) : isLoadingVolume ? (
            /* ----- Weight detected, waiting for volume ----- */
            <div
              className="flex flex-col items-center justify-center gap-6 py-20 rounded-xl"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                border: `1px solid var(--theme-border)`,
              }}
            >
              <div
                className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent"
                style={{ borderColor: "var(--theme-border)", borderTopColor: "transparent" }}
              ></div>
              <p className="text-2xl" style={{ color: "var(--theme-font)" }}>
                {t("Measuring baggage size...")}
              </p>
              <p className="text-lg" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                {t("Please wait a moment")}
              </p>
              <div
                className="mt-2 p-3 rounded-lg"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
              >
                <p className="text-sm" style={{ color: "var(--theme-font)" }}>
                  {t("Weight")}:{" "}
                  <span style={{ fontWeight: "bold", color: "var(--theme-font)" }}>
                    {currentWeight.toFixed(2)} kg
                  </span>
                </p>
              </div>
            </div>
          ) : (
            /* ----- Both weight and volume available ----- */
            <>
              <div className="mb-2">
                <h1 className="text-3xl font-bold" style={{ color: "var(--theme-font)" }}>
                  ⚖️ {t("placeBaggage")}
                </h1>
                <p className="mt-2" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                  {t("scaleInstruction")}
                </p>
                {airline && (
                  <div
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                      border: `1px solid var(--theme-border)`,
                    }}
                  >
                    <span style={{ color: "var(--theme-font)" }}>✈️ {airline}</span>
                    <span style={{ color: "var(--theme-font)", opacity: 0.6 }}>•</span>
                    <span style={{ color: "var(--theme-font)" }}>{flightType}</span>
                    <span style={{ color: "var(--theme-font)", opacity: 0.6 }}>•</span>
                    <span style={{ color: "var(--theme-font)" }}>
                      {origin} → {destination}
                    </span>
                  </div>
                )}
              </div>

              {/* Measurement Cards */}
              <div className="flex justify-center gap-8 w-full max-w-7xl">
                {/* Weight Card */}
                <div
                  className={`relative w-full sm:w-[500px] p-8 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300`}
                  style={{
                    backgroundColor: statusColors[weightStatus].bg,
                    border: `1px solid ${statusColors[weightStatus].border}`,
                  }}
                >
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl rounded-full shadow-lg p-3"
                    style={{
                      backgroundColor: "var(--theme-cardBg)",
                      border: `1px solid var(--theme-border)`,
                    }}
                  >
                    ⚖️
                  </div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--theme-font)" }}>
                    {t("weight")}
                  </h2>
                  <p className="text-7xl font-dsdigital" style={{ color: "var(--theme-font)" }}>
                    {currentWeight > 0 ? currentWeight.toFixed(2) : "--"}{" "}
                    <span className="text-2xl ml-2" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                      {t("kg")}
                    </span>
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                        {t("max")}:
                      </p>
                      <p className="text-xl font-semibold" style={{ color: "var(--theme-font)" }}>
                        {limits.maxWeight || "--"} {t("kg")}
                      </p>
                    </div>
                    <div
                      className="px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: statusColors[weightStatus].bg,
                        border: `1px solid ${statusColors[weightStatus].border}`,
                      }}
                    >
                      <p
                        className="text-lg font-semibold flex items-center gap-2"
                        style={{ color: statusColors[weightStatus].text }}
                      >
                        <span>{statusColors[weightStatus].icon}</span>
                        {weightStatus === "gray"
                          ? t("noBaggage")
                          : weightStatus === "green"
                          ? t("withinLimit")
                          : weightStatus === "yellow"
                          ? t("slightlyOver")
                          : t("overLimit")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Volume Card */}
                <div
                  className={`relative w-full sm:w-[500px] p-8 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300`}
                  style={{
                    backgroundColor: statusColors[volumeStatus].bg,
                    border: `1px solid ${statusColors[volumeStatus].border}`,
                  }}
                >
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl rounded-full shadow-lg p-3"
                    style={{
                      backgroundColor: "var(--theme-cardBg)",
                      border: `1px solid var(--theme-border)`,
                    }}
                  >
                    📏
                  </div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--theme-font)" }}>
                    {t("Total Size (L+W+H)")}
                  </h2>
                  <p className="text-7xl font-dsdigital tracking-widest" style={{ color: "var(--theme-font)" }}>
                    {volume > 0 ? volume : "--"}{" "}
                    <span className="text-2xl ml-2" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                      cm
                    </span>
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                        {t("max")}:
                      </p>
                      <p className="text-xl font-semibold" style={{ color: "var(--theme-font)" }}>
                        {limits.maxVolume || "--"} cm
                      </p>
                    </div>
                    <div
                      className="px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: statusColors[volumeStatus].bg,
                        border: `1px solid ${statusColors[volumeStatus].border}`,
                      }}
                    >
                      <p
                        className="text-lg font-semibold flex items-center gap-2"
                        style={{ color: statusColors[volumeStatus].text }}
                      >
                        <span>{statusColors[volumeStatus].icon}</span>
                        {volumeStatus === "gray"
                          ? t("noBaggage")
                          : volumeStatus === "green"
                          ? t("withinLimit")
                          : volumeStatus === "yellow"
                          ? t("slightlyOver")
                          : t("overLimit")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Dimensions */}
              <div className="flex justify-between gap-4 mt-6">
                <div
                  className="flex-1 p-4 rounded-xl"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    border: `1px solid var(--theme-border)`,
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                    {t("Length")}
                  </p>
                  <p className="text-4xl font-dsdigital" style={{ color: "var(--theme-font)" }}>
                    {dimensions.length > 0 ? dimensions.length : "--"}
                  </p>
                  <span className="text-sm" style={{ color: "var(--theme-font)", opacity: 0.6 }}>
                    cm
                  </span>
                </div>
                <div
                  className="flex-1 p-4 rounded-xl"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    border: `1px solid var(--theme-border)`,
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                    {t("Width")}
                  </p>
                  <p className="text-4xl font-dsdigital" style={{ color: "var(--theme-font)" }}>
                    {dimensions.width > 0 ? dimensions.width : "--"}
                  </p>
                  <span className="text-sm" style={{ color: "var(--theme-font)", opacity: 0.6 }}>
                    cm
                  </span>
                </div>
                <div
                  className="flex-1 p-4 rounded-xl"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    border: `1px solid var(--theme-border)`,
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: "var(--theme-font)", opacity: 0.7 }}>
                    {t("Height")}
                  </p>
                  <p className="text-4xl font-dsdigital" style={{ color: "var(--theme-font)" }}>
                    {dimensions.height > 0 ? dimensions.height : "--"}
                  </p>
                  <span className="text-sm" style={{ color: "var(--theme-font)", opacity: 0.6 }}>
                    cm
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-6 mt-10 flex-wrap justify-center">
            <button
              className="px-8 py-3 font-semibold rounded-xl transition-all duration-200"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                border: `1px solid var(--theme-border)`,
                color: "var(--theme-font)",
              }}
              onClick={() => navigate(-1)}
            >
              {t("scanAgain")}
            </button>
            <button
              className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 ${
                !isReady
                  ? "cursor-not-allowed"
                  : "hover:scale-105 shadow-lg"
              }`}
              style={{
                backgroundColor: !isReady
                  ? "rgba(0, 0, 0, 0.05)"
                  : "rgba(0, 0, 0, 0.1)",
                border: `1px solid var(--theme-border)`,
                color: "var(--theme-font)",
                opacity: !isReady ? 0.5 : 1,
              }}
              onClick={handleCompleteCheck}
              disabled={!isReady}
            >
              {t("completeCheck")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}