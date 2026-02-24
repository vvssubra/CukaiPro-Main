/**
 * CukaiPro Support Widget - loads when CUKAIPRO_SUPPORT_FUNCTION_URL is set.
 */
(function () {
  var FUNCTION_URL = window.CUKAIPRO_SUPPORT_FUNCTION_URL;
  if (!FUNCTION_URL) return;

  var PRIMARY = '#2563eb';
  var sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  var screenshotData = null;
  var isOpen = false;
  var isTyping = false;

  var style = document.createElement('style');
  style.textContent = [
    '#cpro-widget * { box-sizing: border-box; font-family: "Segoe UI", sans-serif; }',
    '#cpro-fab { position: fixed; bottom: 24px; right: 24px; z-index: 99999; width: 56px; height: 56px; border-radius: 50%; background: ' + PRIMARY + '; color: #fff; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.25); font-size: 24px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; }',
    '#cpro-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }',
    '#cpro-panel { position: fixed; bottom: 90px; right: 24px; z-index: 99998; width: 360px; height: 520px; background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.18); display: flex; flex-direction: column; overflow: hidden; transform: scale(0.9) translateY(20px); opacity: 0; transition: transform 0.25s ease, opacity 0.25s ease; pointer-events: none; }',
    '#cpro-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }',
    '#cpro-header { background: ' + PRIMARY + '; color: #fff; padding: 14px 16px; display: flex; align-items: center; gap: 10px; }',
    '#cpro-header h3 { margin: 0; font-size: 15px; font-weight: 600; flex: 1; }',
    '#cpro-header p { margin: 2px 0 0; font-size: 12px; opacity: 0.85; }',
    '#cpro-close { background: none; border: none; color: #fff; cursor: pointer; font-size: 20px; padding: 0; opacity: 0.8; }',
    '#cpro-close:hover { opacity: 1; }',
    '#cpro-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }',
    '.cpro-msg { max-width: 85%; padding: 10px 13px; border-radius: 12px; font-size: 13.5px; line-height: 1.5; }',
    '.cpro-msg.user { background: ' + PRIMARY + '; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }',
    '.cpro-msg.assistant { background: #f1f5f9; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 4px; }',
    '.cpro-typing { display: flex; gap: 4px; align-items: center; padding: 10px 13px; }',
    '.cpro-dot { width: 7px; height: 7px; background: #94a3b8; border-radius: 50%; animation: cpro-bounce 1.2s infinite; }',
    '.cpro-dot:nth-child(2) { animation-delay: 0.2s; }',
    '.cpro-dot:nth-child(3) { animation-delay: 0.4s; }',
    '@keyframes cpro-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }',
    '#cpro-screenshot-bar { padding: 6px 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; }',
    '#cpro-screenshot-bar button { padding: 4px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; font-size: 12px; color: #374151; }',
    '#cpro-screenshot-bar button:hover { background: #f1f5f9; }',
    '#cpro-thumb { width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0; }',
    '#cpro-footer { padding: 12px; border-top: 1px solid #f1f5f9; display: flex; gap: 8px; }',
    '#cpro-input { flex: 1; border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px 13px; font-size: 13.5px; outline: none; resize: none; max-height: 80px; line-height: 1.4; }',
    '#cpro-input:focus { border-color: ' + PRIMARY + '; }',
    '#cpro-send { width: 38px; height: 38px; border-radius: 10px; background: ' + PRIMARY + '; color: #fff; border: none; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; align-self: flex-end; }',
    '#cpro-send:hover { opacity: 0.9; }',
    '#cpro-send:disabled { opacity: 0.5; cursor: not-allowed; }',
  ].join('\n');
  document.head.appendChild(style);

  var widget = document.createElement('div');
  widget.id = 'cpro-widget';
  widget.innerHTML = [
    '<button id="cpro-fab" title="Report a bug">🐛</button>',
    '<div id="cpro-panel">',
    '  <div id="cpro-header">',
    '    <div><h3>🛠 CukaiPro Support</h3><p>Report a bug or ask for help</p></div>',
    '    <button id="cpro-close">✕</button>',
    '  </div>',
    '  <div id="cpro-messages">',
    '    <div class="cpro-msg assistant">Hi! 👋 Jumpa masalah dalam CukaiPro? Saya di sini untuk membantu.<br><br>Please describe the issue you\'re facing — and you can also attach a screenshot!</div>',
    '  </div>',
    '  <div id="cpro-screenshot-bar">',
    '    <span>📎 Screenshot:</span>',
    '    <button id="cpro-upload-btn">Upload</button>',
    '    <button id="cpro-capture-btn">Capture</button>',
    '    <img id="cpro-thumb" style="display:none"/>',
    '    <button id="cpro-remove-btn" style="display:none">✕</button>',
    '    <input type="file" id="cpro-file-input" accept="image/*" style="display:none"/>',
    '  </div>',
    '  <div id="cpro-footer">',
    '    <textarea id="cpro-input" placeholder="Describe the bug..." rows="1"></textarea>',
    '    <button id="cpro-send">➤</button>',
    '  </div>',
    '</div>',
  ].join('\n');
  document.body.appendChild(widget);

  var fab = document.getElementById('cpro-fab');
  var panel = document.getElementById('cpro-panel');
  var closeBtn = document.getElementById('cpro-close');
  var messagesEl = document.getElementById('cpro-messages');
  var inputEl = document.getElementById('cpro-input');
  var sendBtn = document.getElementById('cpro-send');
  var fileInput = document.getElementById('cpro-file-input');
  var uploadBtn = document.getElementById('cpro-upload-btn');
  var captureBtn = document.getElementById('cpro-capture-btn');
  var thumb = document.getElementById('cpro-thumb');
  var removeBtn = document.getElementById('cpro-remove-btn');

  fab.onclick = function () { isOpen = !isOpen; panel.classList.toggle('open', isOpen); if (isOpen) inputEl.focus(); };
  closeBtn.onclick = function () { isOpen = false; panel.classList.remove('open'); };

  uploadBtn.onclick = function () { fileInput.click(); };
  fileInput.onchange = function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) { setScreenshot(ev.target.result); };
    reader.readAsDataURL(file);
  };
  captureBtn.onclick = function () {
    if (!window.html2canvas) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = doCapture;
      document.head.appendChild(s);
    } else { doCapture(); }
  };
  function doCapture() {
    panel.style.display = 'none';
    setTimeout(function () {
      window.html2canvas(document.body).then(function (canvas) {
        panel.style.display = '';
        setScreenshot(canvas.toDataURL('image/png'));
      });
    }, 200);
  }
  function setScreenshot(dataUrl) {
    screenshotData = dataUrl;
    thumb.src = dataUrl;
    thumb.style.display = 'block';
    removeBtn.style.display = 'inline-block';
    uploadBtn.style.display = 'none';
  }
  removeBtn.onclick = function () {
    screenshotData = null;
    thumb.style.display = 'none';
    removeBtn.style.display = 'none';
    uploadBtn.style.display = 'inline-block';
    fileInput.value = '';
  };

  function addMessage(role, text) {
    var div = document.createElement('div');
    div.className = 'cpro-msg ' + role;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }
  function showTyping() {
    var div = document.createElement('div');
    div.className = 'cpro-msg assistant cpro-typing';
    div.id = 'cpro-typing-indicator';
    div.innerHTML = '<div class="cpro-dot"></div><div class="cpro-dot"></div><div class="cpro-dot"></div>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    var el = document.getElementById('cpro-typing-indicator');
    if (el) el.remove();
  }

  async function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || isTyping) return;
    inputEl.value = '';
    isTyping = true;
    sendBtn.disabled = true;
    addMessage('user', text);
    showTyping();

    var payload = {
      action: 'chat',
      session_id: sessionId,
      message: text,
      page_url: window.location.href,
      browser_info: navigator.userAgent,
    };
    if (screenshotData) {
      payload.screenshot_base64 = screenshotData;
      screenshotData = null;
      thumb.style.display = 'none';
      removeBtn.style.display = 'none';
      uploadBtn.style.display = 'inline-block';
    }

    try {
      var res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      var data = await res.json();
      hideTyping();
      addMessage('assistant', data.reply || 'Thank you! Your report has been logged.');
    } catch (err) {
      hideTyping();
      addMessage('assistant', 'Oops, something went wrong. Please try again.');
    }
    isTyping = false;
    sendBtn.disabled = false;
  }

  sendBtn.onclick = sendMessage;
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  inputEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });
})();
