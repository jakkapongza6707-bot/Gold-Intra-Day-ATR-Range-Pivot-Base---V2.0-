<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gold Zone Analyzer Pro</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 15px; background-color: #121212; color: #e0e0e0; margin: 0; }
    .card { max-width: 500px; margin: 0 auto; background: #1e1e1e; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid #2d2d2d; }
    h2, h3 { text-align: center; margin-top: 0; color: #fff; }
    .form-group { margin-bottom: 12px; }
    label { display: block; margin-bottom: 4px; font-size: 13px; color: #a0a0a0; }
    input { width: 100%; padding: 10px; box-sizing: border-box; background: #2a2a2a; border: 1px solid #3d3d3d; border-radius: 6px; font-size: 16px; color: #fff; }
    input:focus { border-color: #3182ce; outline: none; }
    
    .btn-main { width: 100%; padding: 12px; background: #3182ce; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px; }
    .btn-main:hover { background: #2b6cb0; }

    /* Zone Result Styling */
    #resultContainer { margin-top: 25px; display: none; }
    .status-badge { text-align: center; padding: 8px; border-radius: 6px; background: #2a2a2a; font-weight: bold; margin-bottom: 15px; font-size: 13px; color: #ecc94b; border: 1px solid #3d3d3d; }
    
    .zone-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .zone-table th, .zone-table td { padding: 8px 6px; text-align: left; border-bottom: 1px solid #2d2d2d; font-size: 12px; }
    .zone-table th { background: #252525; color: #a0a0a0; text-align: center; }
    
    /* Rows highlight */
    .row-anchor { background: rgba(49, 130, 206, 0.15); }
    .row-max { background: rgba(221, 107, 32, 0.2); }
    .row-min { background: rgba(221, 107, 32, 0.2); }
    
    .price-text { font-weight: bold; font-size: 13px; color: #fff; }
    .orange-highlight { color: #f6ad55; font-weight: bold; }

    /* Summary Card Styling */
    .summary-card { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 12px; margin-top: 15px; font-size: 12px; line-height: 1.6; }
    .summary-title { font-weight: bold; color: #ecc94b; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }

    /* History Section Styling */
    .history-section { margin-top: 30px; border-top: 1px dashed #3d3d3d; padding-top: 20px; }
    .history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .btn-clear-all { background: #e53e3e; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; }
    
    .history-card { background: #252525; border: 1px solid #333; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .history-card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 10px; }
    .history-price { font-size: 18px; font-weight: bold; color: #ecc94b; }
    
    .date-edit-box { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; background: #1a1a1a; padding: 6px; border-radius: 6px; border: 1px solid #333; }
    .date-edit-box label { margin: 0; font-size: 11px; color: #888; white-space: nowrap; }
    .date-input { padding: 4px 6px !important; font-size: 12px !important; background: #2a2a2a !important; color: #ecc94b !important; border: 1px solid #444 !important; border-radius: 4px; }
    .btn-save-date { background: #38a169; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; white-space: nowrap; }
    .btn-save-date:hover { background: #2f855a; }

    .history-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .history-item { background: #1a1a1a; padding: 6px 8px; border-radius: 4px; border: 1px solid #2d2d2d; }
    .history-item-label { font-size: 10px; color: #a0a0a0; }
    .history-item-val { font-size: 13px; font-weight: bold; color: #ecc94b; }

    .history-actions { display: flex; gap: 8px; margin-top: 8px; }
    .btn-reuse { flex: 2; background: #2b6cb0; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; }
    .btn-delete { flex: 1; background: #333; color: #fc8181; border: 1px solid #444; padding: 8px; border-radius: 4px; font-size: 12px; cursor: pointer; }
    .btn-reuse:hover { background: #3182ce; }
    .btn-delete:hover { background: #e53e3e; color: white; }

    /* Modal Styling General */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.75); display: flex; justify-content: center;
      align-items: center; z-index: 9999; backdrop-filter: blur(3px);
    }
    .modal-box {
      background: #181920; border: 1px solid #2a2d3a; border-radius: 16px;
      padding: 24px; width: 88%; max-width: 380px; text-align: center;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
    }
    .modal-box h3 { color: #fff; font-size: 16px; font-weight: 500; margin-bottom: 20px; line-height: 1.4; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; }
    .btn-modal { background: none; border: none; font-size: 15px; font-weight: 600; padding: 8px 16px; cursor: pointer; border-radius: 6px; }
    .btn-cancel { color: #88aaff; }
    .btn-confirm { color: #88aaff; }

    /* Scanning Modal Specific Styling */
    .scan-icon { font-size: 40px; margin-bottom: 8px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
    .scan-title { font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; margin: 0; }
    .scan-sub { font-size: 12px; color: #718096; margin-top: 4px; margin-bottom: 16px; }
    
    .scan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
    .scan-item {
      background: #20232d; border: 1px solid #2d3142; border-radius: 8px; padding: 8px 10px;
      font-size: 11px; font-weight: bold; color: #4a5568; display: flex; align-items: center; gap: 6px;
      transition: all 0.3s ease;
    }
    .scan-item.active { color: #e2e8f0; border-color: #319795; }
    .scan-item.done { color: #319795; border-color: #319795; background: rgba(49, 151, 149, 0.1); }
    .scan-item .icon { font-size: 12px; }

    .progress-bar-container { background: #20232d; border-radius: 10px; height: 6px; overflow: hidden; margin-bottom: 8px; }
    .progress-bar-fill { background: linear-gradient(90deg, #3182ce, #319795); width: 0%; height: 100%; transition: width 0.1s ease; }
    .progress-text { font-size: 12px; font-weight: bold; color: #a0aec0; }
  </style>
</head>
<body>

  <div class="card">
    <h2>📊 Gold Zone Analyzer Pro</h2>
    
    <div class="form-group">
      <label for="currentPrice">Anchor Base / Open Price (ราคาเปิดประจำวัน):</label>
      <input type="number" id="currentPrice" placeholder="เช่น 4640.00" step="any">
    </div>

    <div class="form-group">
      <label for="ma12">D1 MA12:</label>
      <input type="number" id="ma12" placeholder="เช่น 4449.708" step="any">
    </div>

    <div class="form-group">
      <label for="atr14">D1 ATR14:</label>
      <input type="number" id="atr14" placeholder="เช่น 88.814" step="any">
    </div>

    <div class="form-group">
      <label for="sd20">D1 SD20:</label>
      <input type="number" id="sd20" placeholder="เช่น 165.0558" step="any">
    </div>

    <button id="btnAnalyzeMarket" class="btn-main">วิเคราะห์และบันทึกข้อมูล</button>

    <!-- ผลการวิเคราะห์ปัจจุบัน -->
    <div id="resultContainer">
      <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
      <h3>📊 INTRA-DAY ATR ZONES (9 ระดับ)</h3>
      <div id="statusRegime" class="status-badge"></div>

      <table class="zone-table">
        <thead>
          <tr>
            <th style="width: 25%;">Zone Level</th>
            <th style="width: 25%;">ราคา Zone</th>
            <th style="width: 50%;">ความหมายทาง Intraday</th>
          </tr>
        </thead>
        <tbody id="zonesTableBody"></tbody>
      </table>

      <!-- สรุปพิกัดสำคัญ -->
      <div class="summary-card">
        <div class="summary-title">📌 สรุปพิกัดสำคัญ (ครบ 9 ระดับ)</div>
        <div id="summaryContent"></div>
      </div>
    </div>

    <!-- ส่วนประวัติการบันทึก -->
    <div class="history-section">
      <div class="history-header">
        <h3>ประวัติการบันทึก</h3>
        <button id="btnClearHistory" class="btn-clear-all">ล้างทั้งหมด</button>
      </div>
      <div id="historyList">
        <!--รายการประวัติจะแสดงตรงนี้-->
      </div>
    </div>
  </div>

  <!-- Pop-up Confirmation Modal -->
  <div id="confirmModal" class="modal-overlay" style="display: none;">
    <div class="modal-box">
      <h3>ต้องการเริ่มวิเคราะห์และบันทึกข้อมูลหรือไม่?</h3>
      <div class="modal-actions">
        <button id="btnCancelAnalyze" class="btn-modal btn-cancel">ยกเลิก</button>
        <button id="btnConfirmAnalyze" class="btn-modal btn-confirm">ตกลง</button>
      </div>
    </div>
  </div>

  <!-- Pop-up Scanning Animation Modal -->
  <div id="scanModal" class="modal-overlay" style="display: none;">
    <div class="modal-box">
      <div class="scan-icon">🔍</div>
      <div class="scan-title">SCANNING MARKET</div>
      <div class="scan-sub">กำลังตรวจสอบ Market Conditions...</div>
      
      <div class="scan-grid">
        <div class="scan-item" id="chk-0"><span class="icon">○</span> PRICE</div>
        <div class="scan-item" id="chk-1"><span class="icon">○</span> D1 DATA</div>
        <div class="scan-item" id="chk-2"><span class="icon">○</span> D1 ATR / SD</div>
        <div class="scan-item" id="chk-3"><span class="icon">○</span> W1 DATA</div>
        <div class="scan-item" id="chk-4"><span class="icon">○</span> W1 ATR / SD</div>
        <div class="scan-item" id="chk-5"><span class="icon">○</span> ZONES</div>
        <div class="scan-item" id="chk-6"><span class="icon">○</span> ZONE STRENGTH</div>
        <div class="scan-item" id="chk-7"><span class="icon">○</span> VOLATILITY</div>
        <div class="scan-item" id="chk-8"><span class="icon">○</span> MARKET POSITION</div>
        <div class="scan-item" id="chk-9"><span class="icon">○</span> FINAL ANALYSIS</div>
      </div>

      <div class="progress-bar-container">
        <div id="progressFill" class="progress-bar-fill"></div>
      </div>
      <div id="progressText" class="progress-text">0%</div>
    </div>
  </div>

  <script src="script.js?v=1002"></script>
</body>
</html>
