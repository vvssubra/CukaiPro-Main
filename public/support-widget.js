/**
 * CukaiPro Support Widget - loads when CUKAIPRO_SUPPORT_FUNCTION_URL is set.
 * Styled to match CukaiPro theme (forest green, Inter, light/dark).
 */
(function () {
  var FUNCTION_URL = window.CUKAIPRO_SUPPORT_FUNCTION_URL;
  if (!FUNCTION_URL) return;

  // CukaiPro theme (from tailwind.config.js)
  var PRIMARY = '#064E3B';
  var PRIMARY_LIGHT = 'rgba(6, 78, 59, 0.12)';
  var SLATE = '#1E293B';
  var BG_LIGHT = '#f6f8f7';
  var BG_DARK = '#10221d';
  var PANEL_LIGHT = '#ffffff';
  var PANEL_DARK = '#0f1f1b';
  var BORDER_LIGHT = '#e2e8f0';
  var BORDER_DARK = 'rgba(255,255,255,0.08)';
  var TEXT_MUTED_LIGHT = '#64748b';
  var TEXT_MUTED_DARK = 'rgba(255,255,255,0.6)';
  var ASSISTANT_BG_LIGHT = '#f1f5f9';
  var ASSISTANT_BG_DARK = 'rgba(255,255,255,0.06)';
  var EMERALD_ACCENT = '#10b981';

  var sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  var screenshotData = null;
  var isOpen = false;
  var isTyping = false;

  var style = document.createElement('style');
  style.textContent = [
    '#cpro-widget * { box-sizing: border-box; }',
    '#cpro-widget { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }',

    '/* FAB: white background, green icon, clear whitespace so it’s viewable */',
    '#cpro-fab { position: fixed; bottom: 28px; right: 28px; z-index: 99999; width: 56px; height: 56px; margin: 0; padding: 0; border-radius: 14px; background: #fff; color: ' + PRIMARY + '; border: 1px solid ' + BORDER_LIGHT + '; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04); font-size: 0; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }',
    '#cpro-fab:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(6, 78, 59, 0.2), 0 0 0 1px ' + PRIMARY_LIGHT + '; border-color: ' + PRIMARY + '; }',
    '#cpro-fab svg { width: 26px; height: 26px; stroke: ' + PRIMARY + '; }',

    '/* Panel - light */',
    '#cpro-panel { position: fixed; bottom: 96px; right: 28px; z-index: 99998; width: 380px; max-width: calc(100vw - 56px); height: 520px; background: ' + PANEL_LIGHT + '; border-radius: 16px; box-shadow: 0 12px 48px rgba(6, 78, 59, 0.12), 0 0 0 1px ' + BORDER_LIGHT + '; display: flex; flex-direction: column; overflow: hidden; transform: scale(0.96) translateY(16px); opacity: 0; transition: transform 0.25s ease, opacity 0.25s ease; pointer-events: none; }',
    '#cpro-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }',

    '/* Header - light */',
    '#cpro-header { background: ' + PRIMARY + '; color: #fff; padding: 16px 18px; display: flex; align-items: center; gap: 12px; }',
    '#cpro-header h3 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.02em; flex: 1; }',
    '#cpro-header p { margin: 2px 0 0; font-size: 12px; opacity: 0.88; font-weight: 400; }',
    '#cpro-close { background: rgba(255,255,255,0.15); border: none; color: #fff; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; font-size: 16px; padding: 0; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }',
    '#cpro-close:hover { background: rgba(255,255,255,0.25); }',

    '/* Messages */',
    '#cpro-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: ' + BG_LIGHT + '; }',
    '.cpro-msg { max-width: 88%; padding: 11px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; }',
    '.cpro-msg.user { background: ' + PRIMARY + '; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }',
    '.cpro-msg.assistant { background: ' + ASSISTANT_BG_LIGHT + '; color: ' + SLATE + '; align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid ' + BORDER_LIGHT + '; }',
    '.cpro-typing { display: flex; gap: 5px; align-items: center; padding: 12px 14px; }',
    '.cpro-dot { width: 6px; height: 6px; background: ' + TEXT_MUTED_LIGHT + '; border-radius: 50%; animation: cpro-bounce 1.2s infinite; }',
    '.cpro-dot:nth-child(2) { animation-delay: 0.2s; }',
    '.cpro-dot:nth-child(3) { animation-delay: 0.4s; }',
    '@keyframes cpro-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }',

    '/* Screenshot bar - light */',
    '#cpro-screenshot-bar { padding: 10px 14px; background: ' + PANEL_LIGHT + '; border-top: 1px solid ' + BORDER_LIGHT + '; display: flex; align-items: center; gap: 8px; font-size: 12px; color: ' + TEXT_MUTED_LIGHT + '; flex-wrap: wrap; }',
    '#cpro-screenshot-bar button { padding: 6px 12px; border-radius: 8px; border: 1px solid ' + BORDER_LIGHT + '; background: #fff; cursor: pointer; font-size: 12px; font-weight: 500; color: ' + SLATE + '; transition: background 0.15s, border-color 0.15s; }',
    '#cpro-screenshot-bar button:hover { background: ' + BG_LIGHT + '; border-color: ' + PRIMARY + '; color: ' + PRIMARY + '; }',
    '#cpro-thumb { width: 36px; height: 36px; object-fit: cover; border-radius: 8px; border: 1px solid ' + BORDER_LIGHT + '; }',

    '/* Footer - light */',
    '#cpro-footer { padding: 12px 14px; border-top: 1px solid ' + BORDER_LIGHT + '; background: ' + PANEL_LIGHT + '; display: flex; gap: 10px; align-items: flex-end; }',
    '#cpro-input { flex: 1; border: 1px solid ' + BORDER_LIGHT + '; border-radius: 12px; padding: 10px 14px; font-size: 13.5px; outline: none; resize: none; max-height: 88px; line-height: 1.45; background: #fff; color: ' + SLATE + '; transition: border-color 0.2s, box-shadow 0.2s; }',
    '#cpro-input::placeholder { color: ' + TEXT_MUTED_LIGHT + '; }',
    '#cpro-input:focus { border-color: ' + PRIMARY + '; box-shadow: 0 0 0 3px ' + PRIMARY_LIGHT + '; }',
    '#cpro-send { width: 40px; height: 40px; border-radius: 12px; background: ' + PRIMARY + '; color: #fff; border: none; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; align-self: flex-end; transition: opacity 0.15s, transform 0.15s; }',
    '#cpro-send:hover { opacity: 0.92; transform: scale(1.02); }',
    '#cpro-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }',

    '/* Dark mode: respond to html.dark (CukaiPro app toggles this) */',
    'html.dark #cpro-fab { background: ' + PANEL_DARK + '; border-color: ' + BORDER_DARK + '; color: ' + EMERALD_ACCENT + '; box-shadow: 0 4px 20px rgba(0,0,0,0.35); }',
    'html.dark #cpro-fab svg { stroke: ' + EMERALD_ACCENT + '; }',
    'html.dark #cpro-fab:hover { box-shadow: 0 6px 24px rgba(16, 185, 129, 0.25); border-color: ' + EMERALD_ACCENT + '; }',
    'html.dark #cpro-panel { background: ' + PANEL_DARK + '; box-shadow: 0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px ' + BORDER_DARK + '; }',
    'html.dark #cpro-header { background: ' + PRIMARY + '; }',
    'html.dark #cpro-messages { background: ' + BG_DARK + '; }',
    'html.dark .cpro-msg.assistant { background: ' + ASSISTANT_BG_DARK + '; color: rgba(255,255,255,0.9); border-color: ' + BORDER_DARK + '; }',
    'html.dark #cpro-screenshot-bar { background: ' + PANEL_DARK + '; border-top-color: ' + BORDER_DARK + '; color: ' + TEXT_MUTED_DARK + '; }',
    'html.dark #cpro-screenshot-bar button { background: rgba(255,255,255,0.06); border-color: ' + BORDER_DARK + '; color: rgba(255,255,255,0.85); }',
    'html.dark #cpro-screenshot-bar button:hover { background: rgba(255,255,255,0.1); border-color: ' + EMERALD_ACCENT + '; color: ' + EMERALD_ACCENT + '; }',
    'html.dark #cpro-footer { background: ' + PANEL_DARK + '; border-top-color: ' + BORDER_DARK + '; }',
    'html.dark #cpro-input { background: rgba(255,255,255,0.06); border-color: ' + BORDER_DARK + '; color: #fff; }',
    'html.dark #cpro-input::placeholder { color: ' + TEXT_MUTED_DARK + '; }',
    'html.dark #cpro-input:focus { border-color: ' + EMERALD_ACCENT + '; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }',
    'html.dark .cpro-dot { background: ' + TEXT_MUTED_DARK + '; }',
  ].join('\n');
  document.head.appendChild(style);

  var chatIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var sendIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  var widget = document.createElement('div');
  widget.id = 'cpro-widget';
  widget.innerHTML = [
    '<button id="cpro-fab" title="CukaiPro Support" aria-label="Open support chat">' + chatIconSvg + '</button>',
    '<div id="cpro-panel">',
    '  <div id="cpro-header">',
    '    <div><h3>CukaiPro Support</h3><p>Report a bug or get help</p></div>',
    '    <button id="cpro-close" aria-label="Close">✕</button>',
    '  </div>',
    '  <div id="cpro-messages">',
    '    <div class="cpro-msg assistant">Hi! 👋 Jumpa masalah dalam CukaiPro? I\'m here to help.<br><br>Describe the issue below — you can also attach a screenshot.</div>',
    '  </div>',
    '  <div id="cpro-screenshot-bar">',
    '    <span>📎 Screenshot</span>',
    '    <button id="cpro-upload-btn">Upload</button>',
    '    <button id="cpro-capture-btn">Capture</button>',
    '    <img id="cpro-thumb" style="display:none" alt="Preview"/>',
    '    <button id="cpro-remove-btn" style="display:none">✕</button>',
    '    <input type="file" id="cpro-file-input" accept="image/*" style="display:none"/>',
    '  </div>',
    '  <div id="cpro-footer">',
    '    <textarea id="cpro-input" placeholder="Describe the issue..." rows="1"></textarea>',
    '    <button id="cpro-send" aria-label="Send">' + sendIconSvg + '</button>',
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
      addMessage('assistant', 'Something went wrong. Please try again.');
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
    this.style.height = Math.min(this.scrollHeight, 88) + 'px';
  });
})();
