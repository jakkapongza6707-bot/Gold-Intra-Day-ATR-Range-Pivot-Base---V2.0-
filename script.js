// Storage Key
const STORAGE_KEY = 'gold_zone_history_pro';

// DOM Elements
const currentPriceInput = document.getElementById('currentPrice');
const ma12Input = document.getElementById('ma12');
const atr14Input = document.getElementById('atr14');
const sd20Input = document.getElementById('sd20');
const btnAnalyzeMarket = document.getElementById('btnAnalyzeMarket');

const resultContainer = document.getElementById('resultContainer');
const statusRegime = document.getElementById('statusRegime');
const zonesTableBody = document.getElementById('zonesTableBody');
const summaryContent = document.getElementById('summaryContent');
const historyList = document.getElementById('historyList');
const btnClearHistory = document.getElementById('btnClearHistory');

// Confirm Modal Elements
const confirmModal = document.getElementById('confirmModal');
const btnCancelAnalyze = document.getElementById('btnCancelAnalyze');
const btnConfirmAnalyze = document.getElementById('btnConfirmAnalyze');

// Scan Modal Elements
const scanModal = document.getElementById('scanModal');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
});

// Event Listeners
btnAnalyzeMarket.addEventListener('click', () => {
  const currentPrice = parseFloat(currentPriceInput.value);
  const ma12 = parseFloat(ma12Input.value);
  const atr14 = parseFloat(atr14Input.value);
  const sd20 = parseFloat(sd20Input.value);

  if (isNaN(currentPrice) || isNaN(ma12) || isNaN(atr14) || isNaN(sd20)) {
    alert('กรุณากรอกข้อมูลตัวเลขให้ครบถ้วนทุกช่องครับ');
    return;
  }

  confirmModal.style.display = 'flex';
});

btnCancelAnalyze.addEventListener('click', () => {
  confirmModal.style.display = 'none';
  runScanningAnimation(false);
});

btnConfirmAnalyze.addEventListener('click', () => {
  confirmModal.style.display = 'none';
  runScanningAnimation(true);
});

btnClearHistory.addEventListener('click', () => {
  if (confirm('คุณต้องการล้างประวัติการบันทึกทั้งหมดใช่หรือไม่?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  }
});

// Scanning Animation Function
function runScanningAnimation(shouldSave) {
  scanModal.style.display = 'flex';
  
  progressFill.style.width = '0%';
  progressText.textContent = '0%';
  for (let i = 0; i < 10; i++) {
    const el = document.getElementById(`chk-${i}`);
    if (el) {
      el.className = 'scan-item';
      el.querySelector('.icon').textContent = '○';
    }
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    if (progress > 100) progress = 100;

    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;

    const step = Math.floor(progress / 10);
    for (let i = 0; i < step && i < 10; i++) {
      const el = document.getElementById(`chk-${i}`);
      if (el && !el.classList.contains('done')) {
        el.className = 'scan-item done';
        el.querySelector('.icon').textContent = '✓';
      }
    }
    if (step < 10) {
      const activeEl = document.getElementById(`chk-${step}`);
      if (activeEl && !activeEl.classList.contains('done')) {
        activeEl.className = 'scan-item active';
      }
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        scanModal.style.display = 'none';
        
        // คำนวณและแสดงผลตาราง
        executeAnalysis(shouldSave);

        // เลื่อนหน้าจอลงมาที่ตารางผลลัพธ์แบบ Smooth Scroll
        resultContainer.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });

      }, 300);
    }
  }, 25);
}

// Execution & Calculation Function
function executeAnalysis(shouldSave) {
  const currentPrice = parseFloat(currentPriceInput.value);
  const ma12 = parseFloat(ma12Input.value);
  const atr14 = parseFloat(atr14Input.value);
  const sd20 = parseFloat(sd20Input.value);

  const ratio = (sd20 / atr14).toFixed(2);
  let regimeText = "";
  if (ratio > 1.3 && ratio <= 2.0) {
    regimeText = `High Volatility (Ratio: ${ratio})`;
  } else if (ratio > 2.0) {
    regimeText = `Extreme Volatility (Ratio: ${ratio})`;
  } else {
    regimeText = `Normal Volatility (Ratio: ${ratio})`;
  }

  statusRegime.textContent = `VOLATILITY REGIME: ${regimeText}`;

  const zones = [
    { level: "+1.00 ATR", val: currentPrice + (atr14 * 1.00), desc: "แนวต้านขอบบน ATR 100%", rowClass: "" },
    { level: "+0.60 ATR (Daily Max)", val: currentPrice + (atr14 * 0.60), desc: `🟠 วงกลมส้มบน (แนวต้านไฮประจำวัน ${(currentPrice + (atr14 * 0.50)).toFixed(2)}–${(currentPrice + (atr14 * 0.60)).toFixed(2)})`, rowClass: "row-max" },
    { level: "+0.50 ATR", val: currentPrice + (atr14 * 0.50), desc: "โซนเริ่มชะลอตัวฝั่งขาขึ้น", rowClass: "" },
    { level: "+0.25 ATR", val: currentPrice + (atr14 * 0.25), desc: "โซนต้านย่อยระหว่างวัน", rowClass: "" },
    { level: "ANCHOR BASE", val: currentPrice, desc: "จุดสมดุลราคาเปิดประจำวัน", rowClass: "row-anchor" },
    { level: "-0.25 ATR", val: currentPrice - (atr14 * 0.25), desc: "โซนรับย่อยระหว่างวัน", rowClass: "" },
    { level: "-0.50 ATR", val: currentPrice - (atr14 * 0.50), desc: "โซนเริ่มชะลอตัวฝั่งขาลง", rowClass: "" },
    { level: "-0.60 ATR (Daily Min)", val: currentPrice - (atr14 * 0.60), desc: `🟠 วงกลมส้มล่าง (แนวรับโลว์ประจำวัน ${(currentPrice - (atr14 * 0.60)).toFixed(2)}–${(currentPrice - (atr14 * 0.50)).toFixed(2)})`, rowClass: "row-min" },
    { level: "-1.00 ATR", val: currentPrice - (atr14 * 1.00), desc: "แนวรับขอบล่าง ATR 100%", rowClass: "" }
  ];

  zonesTableBody.innerHTML = '';
  zones.forEach(z => {
    const tr = document.createElement('tr');
    if (z.rowClass) tr.className = z.rowClass;
    
    tr.innerHTML = `
      <td style="font-weight: bold; color: ${z.level.includes('ANCHOR') ? '#63b3ed' : (z.level.includes('Max') || z.level.includes('Min') ? '#f6ad55' : '#fff')};">${z.level}</td>
      <td class="price-text">${z.val.toFixed(2)}</td>
      <td style="color: ${z.rowClass ? '#f6ad55' : '#a0a0a0'};">${z.desc}</td>
    `;
    zonesTableBody.appendChild(tr);
  });

  const pUpperMax = (currentPrice + (atr14 * 0.60)).toFixed(2);
  const pUpperMin = (currentPrice + (atr14 * 0.50)).toFixed(2);
  const pSubUpper = (currentPrice + (atr14 * 0.25)).toFixed(2);
  const pSubLower = (currentPrice - (atr14 * 0.25)).toFixed(2);
  const pLowerMin = (currentPrice - (atr14 * 0.60)).toFixed(2);
  const pLowerMax = (currentPrice - (atr14 * 0.50)).toFixed(2);

  summaryContent.innerHTML = `
    • 🔴 <b>วงกลมส้มบน (แนวต้านไฮ):</b> ${pUpperMin} – ${pUpperMax} (+0.50 ถึง +0.60 ATR)<br>
    • ⚪ <b>จุดรับ/ต้านย่อยในวัน:</b> ${pSubUpper} (+0.25 ATR) และ ${pSubLower} (-0.25 ATR)<br>
    • 🟢 <b>วงกลมส้มล่าง (แนวรับโลว์):</b> ${pLowerMin} – ${pLowerMax} (-0.60 ถึง -0.50 ATR)
  `;

  resultContainer.style.display = 'block';

  if (shouldSave) {
    saveToHistory({
      id: Date.now(),
      timestamp: getFormattedDateTime(),
      currentPrice,
      ma12,
      atr14,
      sd20
    });
  }
}

// History Functions
function getHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

function deleteHistory(id) {
  let history = getHistory();
  history = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

function updateHistoryDate(id, newDateStr) {
  let history = getHistory();
  const item = history.find(i => i.id === id);
  if (item) {
    item.timestamp = newDateStr;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    renderHistory();
  }
}

function populateInputs(item) {
  currentPriceInput.value = item.currentPrice;
  ma12Input.value = item.ma12;
  atr14Input.value = item.atr14;
  sd20Input.value = item.sd20;
  
  resultContainer.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<div style="text-align: center; color: #666; font-size: 13px; padding: 10px;">ยังไม่มีประวัติการบันทึก</div>';
    return;
  }

  history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-price">Base: ${item.currentPrice.toFixed(2)}</span>
      </div>

      <div class="date-edit-box">
        <label>วัน-เวลา:</label>
        <input type="text" class="date-input" id="date-input-${item.id}" value="${item.timestamp}">
        <button class="btn-save-date" onclick="handleSaveDate(${item.id})">บันทึกวัน</button>
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
        <div class="history-item" style="grid-column: span 2;">
          <div class="history-item-label">D1 SD20</div>
          <div class="history-item-val">${item.sd20}</div>
        </div>
      </div>

      <div class="history-actions">
        <button class="btn-reuse" onclick='handleReuse(${JSON.stringify(item)})'>🔄 กรอกข้อมูลชุดนี้อีกครั้ง</button>
        <button class="btn-delete" onclick="deleteHistory(${item.id})">ลบ</button>
      </div>
    `;
    historyList.appendChild(card);
  });
}

function handleSaveDate(id) {
  const input = document.getElementById(`date-input-${id}`);
  if (input) {
    updateHistoryDate(id, input.value);
    alert('อัปเดตวันที่เรียบร้อยแล้ว');
  }
}

function handleReuse(item) {
  populateInputs(item);
}

function getFormattedDateTime() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${y} ${hh}:${mm}`;
}
