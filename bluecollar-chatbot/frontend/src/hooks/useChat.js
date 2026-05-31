import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = '/api/chatbot';

export function useChat({ userId, userType, language = 'en' }) {
  const [messages, setMessages]     = useState([]);
  const [isTyping, setIsTyping]     = useState(false);
  const [sessionId, setSessionId]   = useState(null);
  const [connected, setConnected]   = useState(false);
  const [error, setError]           = useState(null);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  // ── WebSocket connection ──────────────────────────────────────────────────
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}://${host}/api/chatbot/ws/${userId}`);

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'typing') {
        setIsTyping(data.is_typing);
      } else if (data.type === 'message') {
        const d = data.data;
        if (d.session_id && !sessionId) setSessionId(d.session_id);
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: d.response,
          quick_replies: d.quick_replies || [],
          suggested_actions: d.suggested_actions || [],
          intent: d.intent,
          confidence: d.confidence,
          response_time_ms: d.response_time_ms,
          detected_language: d.detected_language,
          timestamp: new Date(),
        }]);
        setIsTyping(false);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Auto-reconnect after 3s
      reconnectTimer.current = setTimeout(connectWS, 3000);
    };

    ws.onerror = () => {
      setConnected(false);
      setError('Connection error — retrying...');
    };

    wsRef.current = ws;
  }, [userId, sessionId]);

  useEffect(() => {
    connectWS();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connectWS]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, options = {}) => {
    if (!text?.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
      ...options,
    };
    setMessages(prev => [...prev, userMsg]);

    // Prefer WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message: text,
        user_type: userType,
        language,
        session_id: sessionId,
      }));
      return;
    }

    // Fallback to REST
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_type: userType,
          message: text,
          language,
          session_id: sessionId,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (d.session_id && !sessionId) setSessionId(d.session_id);
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: d.response,
        quick_replies: d.quick_replies || [],
        suggested_actions: d.suggested_actions || [],
        intent: d.intent,
        confidence: d.confidence,
        response_time_ms: d.response_time_ms,
        detected_language: d.detected_language,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "⚠️ Connection issue. Please try again.",
        quick_replies: [],
        suggested_actions: [],
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [userId, userType, language, sessionId]);

  // ── Submit feedback ───────────────────────────────────────────────────────
  const submitFeedback = useCallback(async (messageId, helpful, rating, comment) => {
    try {
      await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, user_id: userId, helpful, rating, comment }),
      });
    } catch { /* silent */ }
  }, [userId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return { messages, isTyping, connected, error, sessionId, sendMessage, submitFeedback, clearMessages };
}
