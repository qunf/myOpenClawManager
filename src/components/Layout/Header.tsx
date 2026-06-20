import { useState } from 'react';
import { PageType } from '../../App';
import { RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  currentPage: PageType;
}

const pageTitleKeys: Record<PageType, { titleKey: string; descKey: string }> = {
  dashboard: { titleKey: 'header.overview', descKey: 'header.overviewDesc' },
  mcp: { titleKey: 'header.mcp', descKey: 'header.mcpDesc' },
  skills: { titleKey: 'header.skills', descKey: 'header.skillsDesc' },
  ai: { titleKey: 'header.ai', descKey: 'header.aiDesc' },
  channels: { titleKey: 'header.channels', descKey: 'header.channelsDesc' },
  agents: { titleKey: 'header.agents', descKey: 'header.agentsDesc' },
  logs: { titleKey: 'header.logs', descKey: 'header.logsDesc' },
  settings: { titleKey: 'header.settings', descKey: 'header.settingsDesc' },
};

export function Header({ currentPage }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { titleKey, descKey } = pageTitleKeys[currentPage];
  const [opening, setOpening] = useState(false);

  const handleOpenDashboard = async () => {
    setOpening(true);
    try {
      // Get Dashboard URL with token (will auto-generate if no token exists)
      const url = await invoke<string>('get_dashboard_url');
      await open(url);
    } catch (e) {
      console.error('Failed to open Dashboard:', e);
      // Fallback: use window.open (without token)
      window.open('http://localhost:18789', '_blank');
    } finally {
      setOpening(false);
    }
  };

  return (
    <header className="h-14 bg-dark-800/50 border-b border-dark-600 flex items-center justify-between px-6 titlebar-drag backdrop-blur-sm">
      {/* Left side: Page title */}
      <div className="titlebar-no-drag">
        <h2 className="text-lg font-semibold text-white">{t(titleKey)}</h2>
        <p className="text-xs text-gray-500">{t(descKey)}</p>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        {/* Language Toggle */}
        <div className="flex items-center bg-dark-600 rounded-lg p-0.5" style={{ minWidth: '96px' }}>
          <button
            onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('language', 'en'); }}
            className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              i18n.language === 'en'
                ? 'bg-claw-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => { i18n.changeLanguage('zh'); localStorage.setItem('language', 'zh'); }}
            className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              i18n.language === 'zh'
                ? 'bg-claw-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            中文
          </button>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="icon-button text-gray-400 hover:text-white"
          title={t('header.refresh')}
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={handleOpenDashboard}
          disabled={opening}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          title={t('header.openDashboard')}
        >
          {opening ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
          <span>{t('header.dashboard')}</span>
        </button>
      </div>
    </header>
  );
}
