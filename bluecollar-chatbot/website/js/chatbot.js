/**
 * Sahayak Chatbot Widget v2 — standalone embed for website pages
 * Works without React/Node — pure vanilla JS
 * Created by Akarsh Chaturvedi
 */
(function () {
  'use strict';

  const API = (window.CHATBOT_API_BASE || 'http://localhost:8000');
  let sessionId   = null;
  let userType    = 'customer';
  let isOpen      = false;
  let unread      = 0;
  let recognition = null;
  let isListening = false;
  let wsConn      = null;

  const QUICK = {
    customer: ['Find a plumber near me', 'Book a worker', 'Track my booking', 'Payment help', 'Raise a dispute'],
    worker:   ['Show jobs near me', 'My earnings today', 'How to get verified', 'Set unavailable tomorrow'],
    admin:    ['Platform metrics', 'Pending disputes', 'Fraud alerts', 'Pending verifications'],
  };

  // ── Inject CSS ─────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #chatbot-fab {
      position:fixed; bottom:24px; right:24px; z-index:9999;
      width:56px; height:56px; border-radius:50%; border:none; cursor:pointer;
      background:linear-gradient(135deg,#4f46e5,#7c3aed);
      color:#fff; font-size:22px; box-shadow:0 4px 20px rgba(79,70,229,.5);
      display:flex; align-items:center; justify-content:center;
      transition:transform .2s; animation:fabPulse 2s infinite;
    }
    #chatbot-fab:hover { transform:scale(1.08); }
    @keyframes fabPulse {
      0%,100%{box-shadow:0 4px 20px rgba(79,70,229,.5)}
      50%{box-shadow:0 4px 32px rgba(79,70,229,.8)}
    }
    #chatbot-unread {
      position:absolute; top:-4px; right:-4px; background:#ef4444;
      color:#fff; border-radius:50%; width:20px; height:20px;
      font-size:11px; font-weight:700; display:none;
      align-items:center; justify-content:center;
    }
    #chatbot-window {
      position:fixed; bottom:90px; right:24px; z-index:9999;
      width:380px; height:600px; border-radius:20px; overflow:hidden;
      background:#fff; box-shadow:0 8px 40px rgba(0,0,0,.18);
      display:none; flex-direction:column;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      border:1px solid #e5e7eb;
    }
    #chatbot-window.open { display:flex; animation:slideUp .25s ease-out; }
    @keyframes slideUp {
      from{transform:translateY(16px);opacity:0}
      to{transform:translateY(0);opacity:1}
    }
    .cb-header {
      background:linear-gradient(135deg,#4f46e5,#7c3aed);
      color:#fff; padding:14px 16px;
      display:flex; align-items:center; gap:10px; flex-shrink:0;
    }
    .cb-avatar { width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);
      display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
    .cb-title { font-weight:600; font-size:15px; }
    .cb-subtitle { font-size:11px; opacity:.85; margin-top:1px; }
    .cb-close { margin-left:auto;background:none;border:none;color:#fff;
      cursor:pointer;font-size:18px;padding:4px;border-radius:6px;
      display:flex;align-items:center;justify-content:center;opacity:.8; }
    .cb-close:hover { opacity:1; background:rgba(255,255,255,.15); }
    .cb-tabs { display:flex; border-bottom:1px solid #e5e7eb; flex-shrink:0; }
    .cb-tab { flex:1;padding:8px 4px;border:none;background:#fff;cursor:pointer;
      font-size:12px;font-weight:500;color:#6b7280;transition:all .15s; }
    .cb-tab.active { color:#4f46e5;border-bottom:2px solid #4f46e5; }
    .cb-tab:hover { background:#f9fafb; }
    .cb-messages { flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:2px; }
    .cb-messages::-webkit-scrollbar{width:4px}
    .cb-messages::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
    .cb-welcome { text-align:center;padding:20px 12px; }
    .cb-welcome .we { font-size:40px;margin-bottom:8px; }
    .cb-welcome h3 { font-size:16px;font-weight:700;color:#111827;margin:0 0 6px; }
    .cb-welcome p { font-size:13px;color:#6b7280;margin:0 0 14px;line-height:1.5; }
    .cb-chips { display:flex;flex-wrap:wrap;gap:6px;justify-content:center; }
    .cb-chip { background:#fff;border:1.5px solid #4f46e5;color:#4f46e5;
      border-radius:20px;padding:5px 12px;font-size:12px;cursor:pointer;
      font-weight:500;transition:all .15s; }
    .cb-chip:hover { background:#4f46e5;color:#fff; }
    .cb-msg { display:flex;gap:8px;margin-bottom:10px;animation:msgIn .2s ease-out; }
    @keyframes msgIn{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
    .cb-msg.user { flex-direction:row-reverse; }
    .cb-msg-av { width:28px;height:28px;border-radius:50%;background:#f3f4f6;
      display:flex;align-items:center;justify-content:center;font-size:14px;
      flex-shrink:0;margin-top:2px; }
    .cb-msg.user .cb-msg-av { background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff; }
    .cb-bubble { padding:10px 14px;border-radius:18px;font-size:14px;
      line-height:1.5;max-width:100%;word-break:break-word;white-space:pre-wrap; }
    .cb-msg.bot .cb-bubble { background:#f3f4f6;color:#1f2937;border-radius:18px 18px 18px 4px; }
    .cb-msg.user .cb-bubble { background:linear-gradient(135deg,#4f46e5,#7c3aed);
      color:#fff;border-radius:18px 18px 4px 18px; }
    .cb-time { font-size:10px;color:#9ca3af;margin-top:3px;padding:0 2px; }
    .cb-msg.user .cb-time { text-align:right; }
    .cb-qrs { display:flex;flex-wrap:wrap;gap:5px;margin-top:6px; }
    .cb-qr { background:#fff;border:1.5px solid #4f46e5;color:#4f46e5;
      border-radius:16px;padding:4px 10px;font-size:11px;cursor:pointer;
      font-weight:500;transition:all .15s; }
    .cb-qr:hover { background:#4f46e5;color:#fff; }
    .cb-typing { display:flex;gap:4px;align-items:center;padding:10px 14px;
      background:#f3f4f6;border-radius:18px 18px 18px 4px; }
    .cb-typing span { width:8px;height:8px;border-radius:50%;background:#9ca3af;
      animation:dot 1.2s infinite; }
    .cb-typing span:nth-child(2){animation-delay:.15s}
    .cb-typing span:nth-child(3){animation-delay:.3s}
    @keyframes dot{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
    .cb-input-area { display:flex;align-items:center;gap:8px;padding:10px 12px;
      border-top:1px solid #e5e7eb;flex-shrink:0; }
    .cb-input { flex:1;border:1.5px solid #e5e7eb;border-radius:24px;
      padding:8px 14px;font-size:14px;outline:none;font-family:inherit;
      transition:border-color .2s; }
    .cb-input:focus { border-color:#4f46e5; }
    .cb-mic { width:36px;height:36px;border-radius:50%;border:none;
      background:#f3f4f6;cursor:pointer;font-size:16px;
      display:flex;align-items:center;justify-content:center;transition:all .2s; }
    .cb-mic.on { background:#ef4444;animation:pulse .8s infinite; }
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
    .cb-send { width:36px;height:36px;border-radius:50%;border:none;
      background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;
      cursor:pointer;font-size:16px;display:flex;align-items:center;
      justify-content:center;transition:all .2s; }
    .cb-send:hover { transform:scale(1.05); }
    .cb-send:disabled { opacity:.4;cursor:not-allowed;transform:none; }
    .cb-footer { text-align:center;font-size:11px;color:#9ca3af;
      padding:6px;flex-shrink:0;border-top:1px solid #f3f4f6; }
    .cb-status { display:flex;align-items:center;gap:4px;font-size:11px;
      padding:4px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;
      flex-shrink:0;color:#6b7280; }
    .cb-dot { width:6px;height:6px;border-radius:50%;background:#10b981; }
    .cb-dot.off { background:#9ca3af; }
    @media(max-width:420px){
      #chatbot-window{width:calc(100vw - 16px);right:8px;bottom:80px;height:70vh;}
    }
  `;
  document.head.appendChild(style);

  // ── Build DOM ──────────────────────────────────────────────────────────────
  const root = document.getElementById('chatbot-root') || (() => {
    const d = document.createElement('div');
    document.body.appendChild(d);
    return d;
  })();

  root.innerHTML = `
    <button id="chatbot-fab" onclick="window.sahayakToggle()" title="Chat with Sahayak">
      💬<span id="chatbot-unread"></span>
    </button>
    <div id="chatbot-window">
      <div class="cb-header">
        <div class="cb-avatar">🤖</div>
        <div>
          <div class="cb-title">Sahayak</div>
          <div class="cb-subtitle" id="cb-status-text">● Online · 24/7 · 100+ languages</div>
        </div>
        <button class="cb-close" onclick="window.sahayakClose()" title="Close">✕</button>
      </div>
      <div class="cb-tabs">
        <button class="cb-tab active" onclick="window.sahayakSetType('customer')">👤 Customer</button>
        <button class="cb-tab"        onclick="window.sahayakSetType('worker')">🔧 Worker</button>
        <button class="cb-tab"        onclick="window.sahayakSetType('admin')">⚙️ Admin</button>
      </div>
      <div class="cb-messages" id="cb-messages"></div>
      <div class="cb-input-area">
        <button class="cb-mic" id="cb-mic" onclick="window.sahayakMic()" title="Voice input">🎙️</button>
        <input  class="cb-input" id="cb-input"
                placeholder="Type a message… (Enter to send)"
                onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window.sahayakSend()}" />
        <button class="cb-send" id="cb-send" onclick="window.sahayakSend()" title="Send">➤</button>
      </div>
      <div class="cb-footer">🔒 Secure · Powered by Sahayak AI</div>
    </div>`;

  showWelcome();
  initSpeech();
  tryWebSocket();

  // ── WebSocket ──────────────────────────────────────────────────────────────
  function tryWebSocket() {
    try {
      const wsBase = API.replace('http://', 'ws://').replace('https://', 'wss://');
      const ws = new WebSocket(`${wsBase}/api/chatbot/ws/web-${userType}-${Date.now()}`);
      ws.onopen  = () => { wsConn = ws; setStatus(true); };
      ws.onclose = () => { wsConn = null; setStatus(false); setTimeout(tryWebSocket, 4000); };
      ws.onerror = () => { wsConn = null; setStatus(false); };
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'typing') {
          if (data.is_typing) showTypingGlobal(); else removeTypingGlobal();
        } else if (data.type === 'message') {
          removeTypingGlobal();
          const d = data.data;
          if (d.session_id) sessionId = d.session_id;
          appendMsg('bot', d.response, d.quick_replies || []);
          if (!isOpen) { unread++; updateBadge(); }
          document.getElementById('cb-send').disabled = false;
        }
      };
    } catch (e) { setStatus(false); }
  }

  function setStatus(online) {
    const el = document.getElementById('cb-status-text');
    if (el) el.textContent = online ? '● Online · 24/7 · 100+ languages' : '○ Reconnecting…';
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.sahayakToggle = () => isOpen ? sahayakClose() : sahayakOpen();
  window.sahayakOpen   = () => {
    isOpen = true;
    document.getElementById('chatbot-window').classList.add('open');
    unread = 0; updateBadge();
    setTimeout(() => document.getElementById('cb-input').focus(), 100);
  };
  window.sahayakClose  = () => {
    isOpen = false;
    document.getElementById('chatbot-window').classList.remove('open');
  };

  window.sahayakSetType = (type) => {
    userType = type; sessionId = null;
    document.querySelectorAll('.cb-tab').forEach((t, i) =>
      t.classList.toggle('active', ['customer','worker','admin'][i] === type));
    showWelcome();
    tryWebSocket();
  };

  window.sahayakSend = async () => {
    const input = document.getElementById('cb-input');
    const text  = input.value.trim();
    if (!text) return;
    input.value = '';
    document.getElementById('cb-send').disabled = true;
    removeWelcome();
    appendMsg('user', text);

    // Prefer WebSocket
    if (wsConn && wsConn.readyState === WebSocket.OPEN) {
      wsConn.send(JSON.stringify({
        message: text, user_type: userType,
        language: 'en', session_id: sessionId,
      }));
      return;
    }

    // REST fallback
    const tid = showTypingGlobal();
    try {
      const res = await fetch(`${API}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: `web-${userType}`, user_type: userType,
          message: text, language: 'en', session_id: sessionId,
        }),
      });
      const data = await res.json();
      if (data.session_id) sessionId = data.session_id;
      removeTypingGlobal();
      appendMsg('bot', data.response, data.quick_replies || []);
      if (!isOpen) { unread++; updateBadge(); }
    } catch {
      removeTypingGlobal();
      appendMsg('bot', '⚠️ Cannot reach the server. Make sure the backend is running on port 8000.');
    }
    document.getElementById('cb-send').disabled = false;
    document.getElementById('cb-input').focus();
  };

  window.sahayakQuick = (text) => {
    document.getElementById('cb-input').value = text;
    window.sahayakSend();
  };

  window.sahayakMic = () => {
    if (!recognition) { alert('Voice input not supported in this browser.'); return; }
    if (isListening) { recognition.stop(); return; }
    isListening = true;
    document.getElementById('cb-mic').classList.add('on');
    document.getElementById('cb-input').placeholder = '🎙️ Listening…';
    recognition.start();
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showWelcome() {
    const msgs = document.getElementById('cb-messages');
    msgs.innerHTML = `
      <div class="cb-welcome" id="cb-welcome">
        <div class="we">👋</div>
        <h3>Hello! I'm Sahayak</h3>
        <p>Your AI assistant for BlueCollar.<br>Ask me anything — in any language!</p>
        <div class="cb-chips">${QUICK[userType].map(q =>
          `<button class="cb-chip" onclick="window.sahayakQuick('${q.replace(/'/g, "\\'")}')">💬 ${q}</button>`
        ).join('')}</div>
      </div>`;
  }

  function removeWelcome() {
    const w = document.getElementById('cb-welcome');
    if (w) w.remove();
  }

  let _typingEl = null;
  function showTypingGlobal() {
    if (_typingEl) return;
    const msgs = document.getElementById('cb-messages');
    const div  = document.createElement('div');
    div.className = 'cb-msg bot';
    div.innerHTML = `<div class="cb-msg-av">🤖</div>
      <div class="cb-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    _typingEl = div;
  }

  function removeTypingGlobal() {
    if (_typingEl) { _typingEl.remove(); _typingEl = null; }
  }

  function appendMsg(role, text, qrs = []) {
    const msgs = document.getElementById('cb-messages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const av   = role === 'bot' ? '🤖' : (userType === 'worker' ? '🔧' : userType === 'admin' ? '⚙️' : '👤');
    const qrHtml = qrs.length
      ? `<div class="cb-qrs">${qrs.map(q =>
          `<button class="cb-qr" onclick="window.sahayakQuick('${(q.payload||q.title).replace(/'/g,"\\'")}')">
            ${esc(q.title)}</button>`).join('')}</div>` : '';
    const div = document.createElement('div');
    div.className = `cb-msg ${role}`;
    div.innerHTML = `
      <div class="cb-msg-av">${av}</div>
      <div>
        <div class="cb-bubble">${esc(text)}</div>
        ${qrHtml}
        <div class="cb-time">${time}</div>
      </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function updateBadge() {
    const b = document.getElementById('chatbot-unread');
    b.textContent = unread;
    b.style.display = unread > 0 ? 'flex' : 'none';
  }

  function esc(t) {
    return String(t)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
  }

  function initSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      document.getElementById('cb-input').value = e.results[0][0].transcript;
      stopMic(); window.sahayakSend();
    };
    recognition.onerror = stopMic;
    recognition.onend   = stopMic;
  }

  function stopMic() {
    isListening = false;
    const mic = document.getElementById('cb-mic');
    if (mic) mic.classList.remove('on');
    const inp = document.getElementById('cb-input');
    if (inp) inp.placeholder = 'Type a message… (Enter to send)';
  }
})();
