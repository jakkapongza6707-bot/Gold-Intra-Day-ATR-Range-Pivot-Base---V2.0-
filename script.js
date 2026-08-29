/* ==========================================
 * GOLD ZONE ANALYZER PRO — INTRADAY ATR ZONES
 * ========================================== */

function safeNumber(val, fallback = 0) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

function round(val, dec = 2) {
  const n = safeNumber(val, 0);
  return Number(n.toFixed(dec));
}

function formatISOToInput(isoString) {
  const d = new Date(isoString);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

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

function calculateIntradayZones(anchorPrice, atr14) {
  const base = safeNumber(anchorPrice, 0);
  const atr = safeNumber(atr14, 0);

  const p100_up = base + (atr * 1.00);
  const p060_up = base + (atr * 0.60);
  const p050_up = base + (atr * 0.50);
  const p025_up = base + (atr * 0.25);

  const p025_dn = base - (atr * 0.25);
  const p050_dn = base - (atr * 0.50);
  const p060_dn = base - (atr * 0.60);
  const p100_dn = base - (atr * 1.00);

  return [
    { level: "+1.00 ATR", price: round(p100_up), desc: "แนวต้านขอบบน ATR 100%", type: "normal" },
    { level: "+0.60 ATR (Daily Max)", price: round(p060_up), desc: `🟠 วงกลมส้มบน (แนวต้านไฮประจำวัน ${round(p050_up)}–${round(p060_up)})`, type: "max" },
    { level: "+0.50 ATR", price: round(p050_up), desc: "โซนเริ่มชะลอตัวฝั่งขาขึ้น", type: "normal" },
    { level: "+0.25 ATR", price: round(p025_up), desc: "โซนต้านย่อยระหว่างวัน", type: "normal" },
    { level: "ANCHOR BASE", price: round(base), desc: "จุดสมดุลราคาเปิดประจำวัน", type: "anchor" },
    { level: "-0.25 ATR", price: round(p025_dn), desc: "โซนรับย่อยระหว่างวัน", type: "normal" },
    { level: "-0.50 ATR", price: round(p050_dn), desc: "โซนเริ่มชะลอตัวฝั่งขาลง", type: "normal" },
    { level: "-0.60 ATR (Daily Min)", price: round(p060_dn), desc: `🟠 วงกลมส้มล่าง (แนวรับโลว์ประจำวัน ${round(p060_dn)}–${round(p050_dn)})`, type: "min" },
    { level: "-1.00 ATR", price: round(p100_dn), desc: "แนวรับขอบล่าง ATR 100%", type: "normal" }
  ];
}

function analyzeCurrentMarketInput(cpInput, maInput, atrInput, sdInput) {
  const currentPrice = safeNumber(cpInput, 0);
  const ma12 = safeNumber(maInput, 0);
  const atr14 = safeNumber(atrInput, 0);
  const sd20 = safeNumber(sdInput, 0);

  if (currentPrice <= 0 || ma12 <= 0 || atr14 <= 0 || sd20 <= 0) {
    throw new Error("กรุณากรอกข้อมูลตัวเลขที่มากกว่า 0 ให้ครบถ้วน");
  }

  const regime = getVolatilityRegime(sd20, atr14);
  const zones = calculateIntradayZones(currentPrice, atr14);

  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    currentPrice,
    ma12,
    atr14,
    sd20,
    regime,
    zones
  };
}

function renderResultsUI(result) {
  const resultContainer = document.getElementById("resultContainer");
  const statusRegime = document.getElementById("statusRegime");
  const zonesTableBody = document.getElementById("zonesTableBody");
  const summaryContent = document.getElementById("summaryContent");

  if (!resultContainer || !zonesTableBody || !statusRegime || !summaryContent) return;

  statusRegime.innerText = `Anchor Base (D1 Open): ${result.currentPrice.toFixed(2)} | D1 ATR14: ${result.atr14.toFixed(4)}`;

  zonesTableBody.innerHTML = result.zones.map(z => {
    let rowClass = "";
    if (z.type === "anchor") rowClass = "row-anchor";
    else if (z.type === "max") rowClass = "row-max";
    else if (z.type === "min") rowClass = "row-min";

    const descHtml = z.desc.includes("🟠") 
      ? `<span class="orange-highlight">${z.desc}</span>`
      : z.desc;

    return `
      <tr class="${rowClass}">
        <td><strong>${z.level}</strong></td>
        <td class="price-text">${z.price.toFixed(2)}</td>
        <td>${descHtml}</td>
      </tr>
    `;
  }).join("");

  const z = result.zones;
  summaryContent.innerHTML = `
    <div>🔴 <strong>วงกลมส้มบน (แนวต้านไฮ):</strong> ${z[2].price.toFixed(2)} – ${z[1].price.toFixed(2)} (+0.50 ถึง +0.60 ATR)</div>
    <div>⚪ <strong>จุดรับ/ต้านย่อยในวัน:</strong> ${z[3].price.toFixed(2)} (+0.25 ATR) และ ${z[5].price.toFixed(2)} (-0.25 ATR)</div>
    <div>🟢 <strong>วงกลมส้มล่าง (แนวรับโลว์):</strong> ${z[7].price.toFixed(2)} – ${z[6].price.toFixed(2)} (-0.50 ถึง -0.60 ATR)</div>
  `;

  resultContainer.style.display = "block";
}

// ฟังก์ชันจำลองการสแกนตลาด (Scanning Animation)
function runScanningAnimation(callback) {
  const scanModal = document.getElementById("scanModal");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  if (!scanModal) {
    if (callback) callback();
    return;
  }

  scanModal.style.display = "flex";
  
  if (progressFill) progressFill.style.width = "0%";
  if (progressText) progressText.textContent = "0%";

  for (let i = 0; i < 10; i++) {
    const el = document.getElementById(`chk-${i}`);
    if (el) {
      el.className = "scan-item";
      const icon = el.querySelector(".icon");
      if (icon) icon.textContent = "○";
    }
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    if (progress > 100) progress = 100;

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}%`;

    const step = Math.floor(progress / 10);
    for (let i = 0; i < step && i < 10; i++) {
      const el = document.getElementById(`chk-${i}`);
      if (el && !el.classList.contains("done")) {
        el.className = "scan-item done";
        const icon = el.querySelector(".icon");
        if (icon) icon.textContent = "✓";
      }
    }
    if (step < 10) {
      const activeEl = document.getElementById(`chk-${step}`);
      if (activeEl && !activeEl.classList.contains("done")) {
        activeEl.className = "scan-item active";
      }
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        scanModal.style.display = "none";
        if (callback) callback();
      }, 300);
    }
  }, 25);
}

function getHistory() {
  const history = localStorage.getItem("GoldZoneHistoryList");
  return history ? JSON.parse(history) : [];
}

function saveToHistory(record) {
  let list = getHistory();
  list.unshift(record);
  localStorage.setItem("GoldZoneHistoryList", JSON.stringify(list));
  renderHistoryUI();
}

function updateHistoryDate(id) {
  const newDateVal = document.getElementById(`date-input-${id}`)?.value;
  if (!newDateVal) return;

  let list = getHistory();
  const index = list.findIndex(item => item.id === id);
  if (index !== -1) {
    list[index].timestamp = new Date(newDateVal).toISOString();
    localStorage.setItem("GoldZoneHistoryList", JSON.stringify(list));
    alert("อัปเดตวันที่เรียบร้อยแล้ว!");
    renderHistoryUI();
  }
}

function deleteHistoryItem(id) {
  if (confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
    let list = getHistory();
    list = list.filter(item => item.id !== id);
    localStorage.setItem("GoldZoneHistoryList", JSON.stringify(list));
    renderHistoryUI();
  }
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

    const resultContainer = document.getElementById("resultContainer");
    if (resultContainer) {
      resultContainer.style.display = "none";
    }

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
        <span class="history-price">💰 Anchor: ${item.currentPrice.toFixed(2)}</span>
      </div>

      <div class="date-edit-box">
        <label>📅 วันที่บันทึก:</label>
        <input type="datetime-local" id="date-input-${item.id}" class="date-input" value="${formatISOToInput(item.timestamp)}">
        <button class="btn-save-date" onclick="updateHistoryDate(${item.id})">💾 บันทึกวันที่</button>
      </div>

      <div class="history-grid">
        <div class="history-item">
          <div class="history-item-label">D1 MA12</div>
          <div class="history-item-val">${item.ma12}</div>
        </div>
        <div class="history-item">
          <div class="history-item-label">D1 ATR14</div>
          <div class="history-item-val">${item.atr14}</div>
        </div>
        <div class="history-item">
          <div class="history-item-label">D1 SD20</div>
          <div class="history-item-val">${item.sd20}</div>
        </div>
        <div class="history-item">
          <div class="history-item-label">VOLATILITY</div>
          <div class="history-item-val">${item.regime ? item.regime.ratio : '-'}</div>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn-reuse" onclick="reuseData(${item.id})">🔄 กรอกข้อมูลชุดนี้อีกครั้ง</button>
        <button class="btn-delete" onclick="deleteHistoryItem(${item.id})">🗑️ ลบ</button>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderHistoryUI();

  const btnAnalyze = document.getElementById("btnAnalyzeMarket");
  const btnClearHistory = document.getElementById("btnClearHistory");

  const confirmModal = document.getElementById("confirmModal");
  const btnCancelAnalyze = document.getElementById("btnCancelAnalyze");
  const btnConfirmAnalyze = document.getElementById("btnConfirmAnalyze");

  let currentAnalysisData = null;

  if (btnAnalyze) {
    btnAnalyze.addEventListener("click", () => {
      try {
        const cp = document.getElementById("currentPrice")?.value;
        const ma = document.getElementById("ma12")?.value;
        const atr = document.getElementById("atr14")?.value;
        const sd = document.getElementById("sd20")?.value;

        currentAnalysisData = analyzeCurrentMarketInput(cp, ma, atr, sd);

        if (confirmModal) {
          confirmModal.style.display = "flex";
        }
      } catch (err) {
        alert("ข้อผิดพลาด: " + err.message);
      }
    });
  }

  if (btnConfirmAnalyze) {
    btnConfirmAnalyze.addEventListener("click", () => {
      confirmModal.style.display = "none";
      runScanningAnimation(() => {
        if (currentAnalysisData) {
          renderResultsUI(currentAnalysisData);
          saveToHistory(currentAnalysisData);
          
          const resultContainer = document.getElementById("resultContainer");
          if (resultContainer) {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  if (btnCancelAnalyze) {
    btnCancelAnalyze.addEventListener("click", () => {
      confirmModal.style.display = "none";
      runScanningAnimation(() => {
        if (currentAnalysisData) {
          renderResultsUI(currentAnalysisData);
          
          const resultContainer = document.getElementById("resultContainer");
          if (resultContainer) {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", clearAllHistory);
  }
});

window.reuseData = reuseData;
window.deleteHistoryItem = deleteHistoryItem;
window.updateHistoryDate = updateHistoryDate;
