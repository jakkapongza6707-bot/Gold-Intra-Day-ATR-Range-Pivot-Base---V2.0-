/* ==========================================
 * GOLD ZONE ANALYZER (WITH ADVANCED HISTORY)
 * ========================================== */

// 1. HELPER FUNCTIONS
function safeNumber(val, fallback = 0) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

function round(val, dec = 2) {
  const n = safeNumber(val, 0);
  return Number(n.toFixed(dec));
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear() + 543; // พ.ศ.
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// 2. CORE ANALYZER LOGIC
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

  return { score, label: getStrengthLabel(score) };
}

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
    return { ...z, score: st.score, strengthLabel: st.label };
  });

  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    currentPrice,
    ma12,
    atr14,
    sd20,
    features,
    zones
  };
}

// 3. UI RENDER FUNCTIONS
function renderResultsUI(result) {
  const resultContainer = document.getElementById("resultContainer");
  const statusRegime = document.getElementById("statusRegime");
  const zonesTableBody = document.getElementById("zonesTableBody");

  if (!resultContainer || !zonesTableBody || !statusRegime) return;

  statusRegime.innerText = `สภาวะตลาด: ${result.features.volatilityText} (Ratio: ${result.features.volatilityRatio})`;

  zonesTableBody.innerHTML = result.zones.map(zone => {
    const typeClass = zone.type === "Resistance" ? "type-resistance" : "type-support";
    let badgeClass = "badge-weak";
    if (zone.score >= 80) badgeClass = "badge-strong";
    else if (zone.score >= 65) badgeClass = "badge-moderate";

    return `
      <tr>
        <td class="${typeClass}">${zone.name}</td>
        <td><strong>${zone.price}</strong></td>
        <td><span class="${badgeClass}">${zone.strengthLabel} (${zone.score})</span></td>
      </tr>
    `;
  }).join("");

  resultContainer.style.display = "block";
}

// 4. HISTORY MANAGEMENT
function getHistory() {
  const history = localStorage.getItem("GoldZoneHistoryList");
  return history ? JSON.parse(history) : [];
}

function saveToHistory(record) {
  let list = getHistory();
  list.unshift(record); // เอาอันใหม่ไว้บนสุด
  localStorage.setItem("GoldZoneHistoryList", JSON.stringify(list));
  renderHistoryUI();
}

function deleteHistoryItem(id) {
  let list = getHistory();
  list = list.filter(item => item.id !== id);
  localStorage.setItem("GoldZoneHistoryList", JSON.stringify(list));
  renderHistoryUI();
}

function clearAllHistory() {
  if (confirm("คุณต้องการลบประวัติทั้งหมดใช่หรือไม่?")) {
    localStorage.removeItem("GoldZoneHistoryList");
    renderHistoryUI();
  }
}

function reuseData(id) {
  const list = getHistory();
  const item = list.find(i => i.id === id);
  if (item) {
    document.getElementById("currentPrice").value = item.currentPrice;
    document.getElementById("ma12").value = item.ma12;
    document.getElementById("atr14").value = item.atr14;
    document.getElementById("sd20").value = item.sd20;
    
    // คำนวณและแสดงผลทันที
    renderResultsUI(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function renderHistoryUI() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  const list = getHistory();
  if (list.length === 0) {
    historyList.innerHTML = `<p style="text-align:center; color:#666; font-size:12px;">ยังไม่มีประวัติการบันทึก</p>`;
    return;
  }

  historyList.innerHTML = list.map(item => `
    <div class="history-card">
      <div class="history-card-header">
        <span class="history-price">💰 ${item.currentPrice.toFixed(2)}</span>
        <span class="history-time">${formatDate(item.timestamp)}</span>
      </div>
      <div class="history-grid">
        <div class="history-item">
          <div class="history-item-label">D1 MA12</div>
          <div class="history-item-val">${item.ma12}</div>
        </div>
        <div class="history-item-label history-item">
          <div class="history-item-label">D1 ATR14</div>
          <div class="history-item-val">${item.atr14}</div>
        </div>
        <div class="history-item">
          <div class="history-item-label">D1 SD20</div>
          <div class="history-item-val">${item.sd20}</div>
        </div>
        <div class="history-item">
          <div class="history-item-label">VOLATILITY</div>
          <div class="history-item-val">${item.features.volatilityRatio}</div>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn-reuse" onclick="reuseData(${item.id})">🔄 กรอกข้อมูลชุดนี้อีกครั้ง</button>
        <button class="btn-delete" onclick="deleteHistoryItem(${item.id})">🗑️ ลบรายการนี้</button>
      </div>
    </div>
  `).join("");
}

// 5. EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
  renderHistoryUI(); // โหลดประวัติเมื่อเปิดหน้าเว็บ

  const btnAnalyze = document.getElementById("btnAnalyzeMarket");
  const btnClearHistory = document.getElementById("btnClearHistory");

  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", () => {
      try {
        const cp = document.getElementById("currentPrice")?.value;
        const ma = document.getElementById("ma12")?.value;
        const atr = document.getElementById("atr14")?.value;
        const sd = document.getElementById("sd20")?.value;

        const result = analyzeCurrentMarketInput(cp, ma, atr, sd);

        // บันทึกลงประวัติ
        saveToHistory(result);

        // แสดงผลลัพธ์
        renderResultsUI(result);

      } catch (err) {
        alert("ข้อผิดพลาด: " + err.message);
      }
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", clearAllHistory);
  }
});

// ส่งออกให้เรียกใช้ผ่าน HTML onclick ได้
window.reuseData = reuseData;
window.deleteHistoryItem = deleteHistoryItem;
