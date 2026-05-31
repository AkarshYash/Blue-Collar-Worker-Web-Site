import clsx from 'clsx';
import { Bell, Bot, Globe, Moon, Save, Shield, Sun, Zap } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
          <Icon size={15} className="text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={clsx(
          'w-10 h-5 rounded-full transition-colors relative flex-shrink-0',
          value ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600',
        )}
      >
        <div className={clsx(
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
          value ? 'translate-x-5' : 'translate-x-0.5',
        )} />
      </button>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useApp();

  const [settings, setSettings] = useState({
    groqApiKey:       '',
    pineconeApiKey:   '',
    telegramToken:    '',
    twilioSid:        '',
    twilioToken:      '',
    redisUrl:         'redis://localhost:6379',
    corsOrigins:      'http://localhost:3000',
    rateLimit:        100,
    sessionTtl:       30,
    ttsEnabled:       true,
    sttEnabled:       true,
    moderationEnabled:true,
    ragEnabled:       true,
    llmEnabled:       true,
    notifEscalations: true,
    notifFraud:       true,
    notifDisputes:    true,
    defaultLanguage:  'en',
    maxHistoryTurns:  20,
  });

  const set = (key) => (val) => setSettings(prev => ({ ...prev, [key]: val }));

  const save = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure your Sahayak instance</p>
        </div>
        <button onClick={save} className="btn-primary flex items-center gap-2 text-sm">
          <Save size={14} /> Save Changes
        </button>
      </div>

      {/* Appearance */}
      <Section title="Appearance" icon={theme === 'dark' ? Moon : Sun}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</p>
            <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark mode</p>
          </div>
          <div className="flex gap-2">
            {['light', 'dark'].map(t => (
              <button
                key={t}
                onClick={() => theme !== t && toggleTheme()}
                className={clsx(
                  'flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-colors capitalize',
                  theme === t
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                )}
              >
                {t === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                {t}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* AI & LLM */}
      <Section title="AI & LLM" icon={Bot}>
        <Field label="Groq API Key" type="password" value={settings.groqApiKey}
          onChange={set('groqApiKey')} placeholder="gsk_..." />
        <Field label="Pinecone API Key" type="password" value={settings.pineconeApiKey}
          onChange={set('pineconeApiKey')} placeholder="pcsk_..." />
        <Toggle label="LLM Fallback" desc="Use Llama 3 70B for unrecognised intents"
          value={settings.llmEnabled} onChange={set('llmEnabled')} />
        <Toggle label="RAG (Vector Search)" desc="Retrieve FAQ context from Pinecone"
          value={settings.ragEnabled} onChange={set('ragEnabled')} />
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Max History Turns
          </label>
          <input type="range" min={5} max={50} value={settings.maxHistoryTurns}
            onChange={e => set('maxHistoryTurns')(+e.target.value)}
            className="w-full accent-brand-600" />
          <p className="text-xs text-gray-400 mt-1">{settings.maxHistoryTurns} turns kept in session memory</p>
        </div>
      </Section>

      {/* Integrations */}
      <Section title="Integrations" icon={Zap}>
        <Field label="Telegram Bot Token" type="password" value={settings.telegramToken}
          onChange={set('telegramToken')} placeholder="123456:ABC..." />
        <Field label="Twilio Account SID" type="password" value={settings.twilioSid}
          onChange={set('twilioSid')} placeholder="ACxxxxxxxx..." />
        <Field label="Twilio Auth Token" type="password" value={settings.twilioToken}
          onChange={set('twilioToken')} placeholder="auth token..." />
        <Field label="Redis URL" value={settings.redisUrl}
          onChange={set('redisUrl')} placeholder="redis://localhost:6379" />
      </Section>

      {/* Voice */}
      <Section title="Voice & Language" icon={Globe}>
        <Toggle label="Text-to-Speech" desc="Read bot responses aloud"
          value={settings.ttsEnabled} onChange={set('ttsEnabled')} />
        <Toggle label="Speech-to-Text" desc="Allow voice input via microphone"
          value={settings.sttEnabled} onChange={set('sttEnabled')} />
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Default Language
          </label>
          <select value={settings.defaultLanguage} onChange={e => set('defaultLanguage')(e.target.value)}
            className="input-base">
            {[['en','English'],['hi','Hindi'],['ta','Tamil'],['te','Telugu'],['mr','Marathi']].map(([c,l]) => (
              <option key={c} value={c}>{l}</option>
            ))}
          </select>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security & Moderation" icon={Shield}>
        <Toggle label="Content Moderation" desc="Block harmful content and mask PII"
          value={settings.moderationEnabled} onChange={set('moderationEnabled')} />
        <Field label="CORS Origins" value={settings.corsOrigins}
          onChange={set('corsOrigins')} placeholder="http://localhost:3000,https://yourdomain.com" />
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Rate Limit (req/min)
          </label>
          <input type="number" value={settings.rateLimit} min={10} max={1000}
            onChange={e => set('rateLimit')(+e.target.value)}
            className="input-base w-32" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Session TTL (minutes)
          </label>
          <input type="number" value={settings.sessionTtl} min={5} max={120}
            onChange={e => set('sessionTtl')(+e.target.value)}
            className="input-base w-32" />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Toggle label="Escalation Alerts" desc="Notify when a session is escalated to human"
          value={settings.notifEscalations} onChange={set('notifEscalations')} />
        <Toggle label="Fraud Alerts" desc="Notify on high-risk fraud detections"
          value={settings.notifFraud} onChange={set('notifFraud')} />
        <Toggle label="Dispute Alerts" desc="Notify on new dispute submissions"
          value={settings.notifDisputes} onChange={set('notifDisputes')} />
      </Section>

      <div className="flex justify-end pb-6">
        <button onClick={save} className="btn-primary flex items-center gap-2">
          <Save size={14} /> Save All Settings
        </button>
      </div>
    </div>
  );
}
