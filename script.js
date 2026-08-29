/* ==========================================
 * GOLD ZONE ANALYZER (LIVE ENGINE) - REST API FIXED
 * ========================================== */

// 1. SUPABASE SETUP
const SUPABASE_URL = "https://xuxvowhghgndyfsedpzs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_l5UISnbptCI8T6HwE7di2w_0e7ZGyqR";

// 2. HELPER FUNCTIONS
function safeNumber(val, fallback = 0) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

function round(val, dec = 2) {
  const n = safeNumber(val, 0);
  return Number(n.toFixed(dec));
}

// 3. CORE ANALYZER LOGIC
function getVolatilityRegime(sd20, atr14) {
  const sd = safeNumber(sd20, 0);
  const atr = safeNumber(atr14, 0);
  if (atr <= 0) return { ratio: 0, text: "Normal" };

  const ratio = sd / atr;
  if (ratio >= 2.0) return { ratio: round(ratio, 2), text: "Extreme Volatility" };
  if (ratio >= 1.3) return { ratio: round(ratio, 2), text: "High Volatility" };
  if (ratio >= 0.8) return { ratio: round(ratio, 2), text: "Normal" };
  return { ratio: round(ratio, 2), text: "Low Volatility" };
}

function getMarketPosition(currentPrice, ma12, atr14, sd20) {
  const cp = safeNumber(currentPrice, 0);
  const ma = safeNumber(ma12, 0);
  const atr = safeNumber(atr14, 0);
  const sd = safeNumber(sd20, 0);

  const distMA = cp - ma;
  const distATR = atr > 0 ? distMA / atr : 0;
  const distSD = sd > 0 ? distMA / sd : 0;

  let zoneTag = "Middle Range";
  if (distMA >= atr * 0.5) zoneTag = "Upper Range";
  else if (distMA <= -atr * 0.5) zoneTag = "Lower Range";

  return {
    distMA: round(distMA, 2),
    distATR: round(distATR, 2),
    distSD: round(distSD, 2),
    zoneTag
  };
}

function calculateMarketFeatures(cp, ma12, atr14, sd20) {
  const regime = getVolatilityRegime(sd20, atr14);
  const pos = getMarketPosition(cp, ma12, atr14, sd20);

  return {
    volatilityRatio: regime.ratio,
    volatilityText: regime.text,
    distMA: pos.distMA,
    distATR: pos.distATR,
    distSD: pos.distSD,
    zoneTag: pos.zoneTag
  };
}

function getStrengthLabel(score) {
  const s = safeNumber(score, 0);
  if (s >= 80) return "Strong";
  if (s >= 65) return "Moderate";
  if (s >= 50) return "Weak";
  return "Very Weak";
}

function createD1Zones(currentPrice, atr14, sd20) {
  const cp = safeNumber(currentPrice, 0);
  const atr = safeNumber(atr14, 0);
  const sd = safeNumber(sd20, 0);

  return [
    { type: "Resistance", name: "R3 (SD 2.0)", price: round(cp + sd * 2.0) },
    { type: "Resistance", name: "R2 (ATR 1.5)", price: round(cp + atr * 1.5) },
    { type: "Resistance", name: "R1 (ATR 1.0)", price: round(cp + atr * 1.0) },
    { type: "Support", name: "S1 (ATR 1.0)", price: round(cp - atr * 1.0) },
    { type: "Support", name: "S2 (ATR 1.5)", price: round(cp - atr * 1.5) },
    { type: "Support", name: "S3 (SD 2.0)", price: round(cp - sd * 2.0) }
  ];
}

function scoreZoneStrength(zone, currentPrice, ma12, atr14, sd20) {
  let score = 50;
  const cp = safeNumber(currentPrice, 0);
  const ma = safeNumber(ma12, 0);
  const atr = safeNumber(atr14, 0);
  const sd = safeNumber(sd20, 0);
  const zonePrice = safeNumber(zone.price, 0);

  const isResistance = zone.type === "Resistance";
  const isSupport = zone.type === "Support";

  if (isResistance && cp > ma) score += 10;
  if (isSupport && cp < ma) score += 10;

  const distToZone = Math.abs(zonePrice - cp);
  if (atr > 0) {
    if (distToZone >= atr * 0.8 && distToZone <= atr * 1.8) score += 15;
    else if (distToZone < atr * 0.4) score -= 10;
  }

  if (sd > 0 && atr > 0) {
    const volRatio = sd / atr;
    if (volRatio >= 1.3) score += 10;
    if (volRatio >= 2.0) score += 5;
  }

  if (zone.name.includes("SD 2.0")) score += 10;

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    label: getStrengthLabel(score)
  };
}

// 4. MAIN ANALYZER FUNCTION
function analyzeCurrentMarketInput(cpInput, maInput, atrInput, sdInput) {
  const currentPrice = safeNumber(cpInput, 0);
  const ma12 = safeNumber(maInput, 0);
  const atr14 = safeNumber(atrInput, 0);
  const sd20 = safeNumber(sdInput, 0);

  if (currentPrice <= 0 || ma12 <= 0 || atr14 <= 0 || sd20 <= 0) {
    throw new Error("กรุณากรอกข้อมูลตัวเลขที่มากกว่า 0 ให้ครบถ้วน");
  }

  const features = calculateMarketFeatures(currentPrice, ma12, atr14, sd20);
  const rawZones = createD1Zones(currentPrice, atr14, sd20);

  const zones = rawZones.map(z => {
    const st = scoreZoneStrength(z, currentPrice, ma12, atr14, sd20);
    return {
      ...z,
      score: st.score,
      strengthLabel: st.label
    };
  });

  return {
    currentPrice,
    ma12,
    atr14,
    sd20,
    features,
    zones
  };
}

// 5. SUPABASE DB SYNC (ยิงตรงผ่าน Direct Fetch REST API)
async function saveAnalysisToSupabase(payload) {
  try {
    const record = {
      current_price: payload.currentPrice,
      ma12: payload.ma12,
      atr14: payload.atr14,
      sd20: payload.sd20,
      volatility_ratio: payload.features.volatilityRatio,
      volatility_text: payload.features.volatilityText,
      dist_ma: payload.features.distMA,
      dist_atr: payload.features.distATR,
      dist_sd: payload.features.distSD,
      zone_tag: payload.features.zoneTag,
      zones_data: payload.zones,
      created_at: new Date().toISOString()
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/gold_settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP status ${response.status}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Supabase Save Error:", err);
    return { success: false, error: err.message };
  }
}

// 6. UI EVENT HANDLER
document.addEventListener("DOMContentLoaded", () => {
  const btnAnalyze = document.getElementById("btnAnalyzeMarket");

  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", async () => {
      try {
        const cp = document.getElementById("currentPrice")?.value;
        const ma = document.getElementById("ma12")?.value;
        const atr = document.getElementById("atr14")?.value;
        const sd = document.getElementById("sd20")?.value;

        const result = analyzeCurrentMarketInput(cp, ma, atr, sd);
        console.log("Analysis Result:", result);

        // บันทึกลง LocalStorage
        localStorage.setItem("GoldZoneLatestAnalysis", JSON.stringify(result));

        // ส่งข้อมูลเข้า Supabase
        btnAnalyze.disabled = true;
        btnAnalyze.innerText = "กำลังบันทึกข้อมูล...";

        const dbRes = await saveAnalysisToSupabase(result);
        
        btnAnalyze.disabled = false;
        btnAnalyze.innerText = "วิเคราะห์และบันทึกข้อมูล";

        if (dbRes.success) {
          alert("วิเคราะห์และบันทึกข้อมูลลง Supabase เรียบร้อย!");
        } else {
          alert("วิเคราะห์สำเร็จ แต่ไม่สามารถบันทึกลง DB ได้: " + dbRes.error);
        }

      } catch (err) {
        alert("ข้อผิดพลาด: " + err.message);
      }
    });
  }
});

// Window API
window.GoldZoneAnalyzer = {
  analyze: analyzeCurrentMarketInput,
  saveToSupabase: saveAnalysisToSupabase
};
