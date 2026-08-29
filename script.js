/* ==========================================
 * GOLD ZONE ANALYZER PRO — CLOUD SYNC & FULL FEATURES
 * ========================================== */

const SUPABASE_URL = 'https://ctolckvhfojrchzjaqyo.supabase.co';
const SUPABASE_ANON_KEY = 'Sb_publishable_l5UISnbptCI8T6HwE7di2w_0e7ZGyqR';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;

// ระบบ Login / Logout ด้วย Email (Magic Link)
async function handleAuthAction() {
  if (currentUser) {
    await supabaseClient.auth.signOut();
    alert("ออกจากระบบเรียบร้อย");
    window.location.reload();
  } else {
    const email = prompt("กรุณากรอกอีเมลของคุณเพื่อเข้าสู่ระบบ/สมัครใช้งาน:");
    if (!email) return;
    
    const { error } = await supabaseClient.auth.signInWithOtp({ email });
    if (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } else {
      alert("ระบบได้ส่งลิงก์เข้าสู่ระบบไปยังอีเมล " + email + " แล้ว กรุณาตรวจสอบอีเมลครับ");
    }
  }
}

async function checkUserSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  currentUser = session ? session.user : null;
  
  const userInfo = document.getElementById("userInfo");
  const authBtn = document.getElementById("authBtn");

  if (currentUser) {
    if (userInfo) userInfo.textContent = `👤 ${currentUser.email}`;
    if (authBtn) {
      authBtn.textContent = "ออกจากระบบ";
      authBtn.className = "auth-btn logout";
    }
    
    // ทำการย้ายข้อมูลเก่าจาก LocalStorage ขึ้น Cloud อัตโนมัติ (ถ้ามี)
    await migrateLocalStorageToCloud();
    
    renderHistoryUI();
  } else {
    if (userInfo) userInfo.textContent = "⚠️ ยังไม่ได้เข้าสู่ระบบ (กรุณา Login เพื่อซิงค์ Cloud)";
    if (authBtn) {
      authBtn.textContent = "เข้าสู่ระบบ";
      authBtn.className = "auth-btn";
    }
    const historyList = document.getElementById("historyList");
    if (historyList) {
      historyList.innerHTML = `<p style="text-align:center; color:#666; font-size:12px;">กรุณาเข้าสู่ระบบเพื่อดูประวัติบน Cloud</p>`;
    }
  }
}

// ฟังก์ชันย้ายข้อมูล LocalStorage เดิมขึ้น Supabase อัตโนมัติ
async function migrateLocalStorageToCloud() {
  const localData = localStorage.getItem("GoldZoneHistoryList");
  if (!localData) return;

  try {
    const localList = JSON.parse(localData);
    if (localList.length === 0) return;

    console.log("กำลังย้ายข้อมูลเก่าขึ้น Cloud...");
    for (let item of localList) {
      await supabaseClient.from('gold_history').insert([{
        user_id: currentUser.id,
        timestamp: item.timestamp || new Date().toISOString(),
        current_price: item.currentPrice,
        ma12: item.ma12,
        atr14: item.atr14,
        sd20: item.sd20
      }]);
    }

    localStorage.removeItem("GoldZoneHistoryList");
    console.log("ย้ายข้อมูลเก่าสำเร็จ!");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

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

// --- ฟังก์ชันจัดการข้อมูลบน Cloud (Supabase) ---
async function saveToCloud(record) {
  if (!currentUser) {
    alert("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูลลง Cloud");
    return;
  }

  const { error } = await supabaseClient.from('gold_history').insert([{
    user_id: currentUser.id,
    timestamp: record.timestamp,
    current_price: record.currentPrice,
    ma12: record.ma12,
    atr14: record.atr14,
    sd20: record.sd20
  }]);

  if (error) {
    alert("บันทึกไม่สำเร็จ: " + error.message);
  } else {
    renderHistoryUI();
  }
}

async function getHistoryFromCloud() {
  if (!currentUser) return [];
  const { data, error } = await supabaseClient
    .from('gold_history')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }
  return data;
}

async function updateHistoryDate(id) {
  const newDateVal = document.getElementById(`date-input-${id}`)?.value;
  if (!newDateVal) return;

  const newIsoString = new Date(newDateVal).toISOString();
  const { error } = await supabaseClient
    .from('gold_history')
    .update({ timestamp: newIsoString })
    .eq('id', id);

  if (error) {
    alert("อัปเดตวันที่ไม่สำเร็จ: " + error.message);
  } else {
    alert("อัปเดตวันที่เรียบร้อยแล้ว!");
    renderHistoryUI();
  }
}

async function deleteHistoryItem(id) {
  if (confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
    const { error } = await supabaseClient.from('gold_history').delete().eq('id', id);
    if (error) {
      alert("ลบไม่สำเร็จ: " + error.message);
    } else {
      renderHistoryUI();
    }
  }
}

async function clearAllHistory() {
  if (confirm("คุณต้องการลบประวัติทั้งหมดใช่หรือไม่?")) {
    const { error } = await supabaseClient.from('gold_history').delete().eq('user_id', currentUser.id);
    if (error) {
      alert("ลบไม่สำเร็จ: " + error.message);
    } else {
      renderHistoryUI();
    }
  }
}

async function reuseData(id) {
  const list = await getHistoryFromCloud();
  const item = list.find(i => i.id === id);
  if (item) {
    document.getElementById("currentPrice").value = item.current_price;
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

async function renderHistoryUI() {
  const historyList = document.getElementById("historyList");
  if (!historyList || !currentUser) return;

  const list = await getHistoryFromCloud();
  if (list.length === 0) {
    historyList.innerHTML = `<p style="text-align:center; color:#666; font-size:12px;">ยังไม่มีประวัติการบันทึกบน Cloud</p>`;
    return;
  }

  historyList.innerHTML = list.map(item => `
    <div class="history-card">
      <div class="history-card-header">
        <span class="history-price">💰 Anchor: ${item.current_price.toFixed(2)}</span>
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
          <div class="history-item-val">${getVolatilityRegime(item.sd20, item.atr14).ratio}</div>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn-reuse" onclick="reuseData(${item.id})">🔄 กรอกข้อมูลชุดนี้อีกครั้ง</button>
        <button class="btn-delete" onclick="deleteHistoryItem(${item.id})">🗑️ ลบ</button>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkUserSession();

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
      runScanningAnimation(async () => {
        if (currentAnalysisData) {
          renderResultsUI(currentAnalysisData);
          await saveToCloud(currentAnalysisData);
          
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
window.handleAuthAction = handleAuthAction;
