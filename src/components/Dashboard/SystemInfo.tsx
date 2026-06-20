import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import {
  CheckCircle2,
  Loader2,
  Download,
  ExternalLink,
  Cpu,
  GitBranch,
  Package,
  Shield,
  RefreshCw,
  Server,
  FolderOpen,
} from 'lucide-react';
import { isTauri } from '../../lib/tauri';
import { useTranslation } from 'react-i18next';

interface EnvironmentStatus {
  node_installed: boolean;
  node_version: string | null;
  node_version_ok: boolean;
  git_installed: boolean;
  git_version: string | null;
  openclaw_installed: boolean;
  openclaw_version: string | null;
  gateway_service_installed: boolean;
  config_dir_exists: boolean;
  ready: boolean;
  os: string;
}

interface InstallResult {
  success: boolean;
  message: string;
  error: string | null;
}

interface Requirement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  installed: boolean;
  version: string | null;
  versionOk?: boolean;
  versionNote?: string;
  installAction?: () => void;
  downloadUrl?: string;
  canAutoInstall: boolean;
}

export function SystemInfo() {
  const { t } = useTranslation();
  const [envStatus, setEnvStatus] = useState<EnvironmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Custom path states
  const [showInstallPathInput, setShowInstallPathInput] = useState(false);
  const [installPath, setInstallPath] = useState('');
  const [showSpecifyPath, setShowSpecifyPath] = useState(false);
  const [specifyPath, setSpecifyPath] = useState('');

  const checkEnvironment = async () => {
    if (!isTauri()) {
      setLoading(false);
      return;
    }
    try {
      const status = await invoke<EnvironmentStatus>('check_environment');
      setEnvStatus(status);
      setError(null);
    } catch (e) {
      setError(t('dashboard.system.checkFailed', { error: e }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkEnvironment();
  };

  const handleInstallNodejs = async () => {
    setInstalling('nodejs');
    setError(null);
    try {
      const result = await invoke<InstallResult>('install_nodejs');
      if (result.success) {
        await checkEnvironment();
      } else {
        setError(result.error || result.message);
      }
    } catch (e) {
      setError(t('dashboard.system.installNodeFailed', { error: e }));
    } finally {
      setInstalling(null);
    }
  };

  const handleInstallOpenclaw = async (customPath?: string) => {
    setInstalling('openclaw');
    setError(null);
    try {
      const pathParam = customPath || installPath || null;
      const result = await invoke<InstallResult>('install_openclaw', { installPath: pathParam });
      if (result.success) {
        await invoke<InstallResult>('init_openclaw_config');
        await checkEnvironment();
        setShowInstallPathInput(false);
        setInstallPath('');
      } else {
        setError(result.error || result.message);
      }
    } catch (e) {
      setError(t('dashboard.system.installOpenclawFailed', { error: e }));
    } finally {
      setInstalling(null);
    }
  };

  const handleSpecifyPath = async () => {
    if (!specifyPath.trim()) return;
    try {
      await invoke('save_custom_openclaw_path', { path: specifyPath.trim() });
      await checkEnvironment();
      setShowSpecifyPath(false);
      setSpecifyPath('');
    } catch (e) {
      setError(t('dashboard.system.checkFailed', { error: e }));
    }
  };

  const handleInstallGateway = async () => {
    setInstalling('gateway');
    setError(null);
    try {
      await invoke<string>('install_gateway_service');
      // Gateway install opens an elevated terminal — user needs to complete it there
      // Don't auto-refresh; user clicks Refresh when done
    } catch (e) {
      setError(t('dashboard.system.installGatewayFailed', { error: e }));
    } finally {
      setInstalling(null);
    }
  };

  const handleOpenUrl = async (url: string) => {
    try {
      await open(url);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-700 rounded-2xl p-6 border border-dark-500">
        <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.system.title')}</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-claw-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!envStatus) {
    return (
      <div className="bg-dark-700 rounded-2xl p-6 border border-dark-500">
        <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.system.title')}</h3>
        <p className="text-gray-400 text-sm">{t('dashboard.system.unableDetect')}</p>
      </div>
    );
  }

  const requirements: Requirement[] = [
    {
      id: 'nodejs',
      name: t('dashboard.system.nodejs'),
      description: t('dashboard.system.nodejsDesc'),
      icon: <Cpu size={18} />,
      installed: envStatus.node_installed && envStatus.node_version_ok,
      version: envStatus.node_version,
      versionOk: envStatus.node_version_ok,
      versionNote: envStatus.node_installed && !envStatus.node_version_ok
        ? t('dashboard.system.nodejsOld')
        : undefined,
      installAction: handleInstallNodejs,
      downloadUrl: 'https://nodejs.org/en/download',
      canAutoInstall: true,
    },
    {
      id: 'git',
      name: t('dashboard.system.git'),
      description: t('dashboard.system.gitDesc'),
      icon: <GitBranch size={18} />,
      installed: envStatus.git_installed,
      version: envStatus.git_version,
      downloadUrl: 'https://git-scm.com/downloads',
      canAutoInstall: false,
    },
    {
      id: 'openclaw',
      name: t('dashboard.system.openclaw'),
      description: t('dashboard.system.openclawDesc'),
      icon: <Package size={18} />,
      installed: envStatus.openclaw_installed,
      version: envStatus.openclaw_version,
      installAction: handleInstallOpenclaw,
      canAutoInstall: true,
    },
    ...(envStatus.openclaw_installed ? [{
      id: 'gateway',
      name: t('dashboard.system.gateway'),
      description: t('dashboard.system.gatewayDesc'),
      icon: <Server size={18} />,
      installed: envStatus.gateway_service_installed,
      version: null,
      installAction: handleInstallGateway,
      canAutoInstall: true,
    }] : []),
  ];

  const installedCount = requirements.filter(r => r.installed).length;
  const totalCount = requirements.length;
  const allReady = installedCount === totalCount;
  const progressPercent = Math.round((installedCount / totalCount) * 100);

  return (
    <div className="bg-dark-700 rounded-2xl p-6 border border-dark-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${allReady ? 'bg-green-500/20' : 'bg-amber-500/20'
            }`}>
            <Shield size={18} className={allReady ? 'text-green-400' : 'text-amber-400'} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t('dashboard.system.title')}</h3>
            <p className="text-xs text-gray-500">
              {allReady
                ? t('dashboard.system.allReady')
                : t('dashboard.system.prereqProgress', { installed: installedCount, total: totalCount })}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
          title={t('dashboard.system.recheck')}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="w-full h-1.5 bg-dark-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allReady
              ? 'bg-green-500'
              : progressPercent > 50
                ? 'bg-amber-500'
                : 'bg-red-500'
              }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Requirements list */}
      <div className="space-y-3">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={`flex flex-col p-3 rounded-xl border transition-colors ${req.installed
              ? 'bg-green-500/5 border-green-500/10'
              : 'bg-red-500/5 border-red-500/15'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${req.installed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                  {req.installed ? <CheckCircle2 size={16} /> : req.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{req.name}</span>
                    {req.installed && req.version && (
                      <span className="text-xs text-gray-500 font-mono">{req.version}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {req.versionNote || req.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {req.installed ? (
                  <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/10 rounded-md">
                    {t('dashboard.system.ready')}
                  </span>
                ) : (
                  <>
                    {req.canAutoInstall && req.installAction && (
                      <>
                        {req.id === 'openclaw' && !showInstallPathInput ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => req.installAction?.()}
                              disabled={installing !== null}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-claw-600 hover:bg-claw-700 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                            >
                              {installing === req.id ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  <span>{t('dashboard.system.installing')}</span>
                                </>
                              ) : (
                                <>
                                  <Download size={12} />
                                  <span>{t('dashboard.system.install')}</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setShowInstallPathInput(true)}
                              disabled={installing !== null}
                              className="flex items-center gap-1 px-2 py-1.5 text-gray-400 hover:text-white hover:bg-dark-500 rounded-lg transition-colors text-xs"
                              title={t('dashboard.system.customPath')}
                            >
                              <FolderOpen size={12} />
                            </button>
                          </div>
                        ) : req.id === 'openclaw' && showInstallPathInput ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={installPath}
                              onChange={(e) => setInstallPath(e.target.value)}
                              placeholder={t('dashboard.system.installPathPlaceholder')}
                              className="flex-1 px-2 py-1 text-xs bg-dark-600 border border-dark-500 rounded text-white placeholder-gray-500 min-w-[200px]"
                            />
                            <button
                              onClick={() => handleInstallOpenclaw()}
                              disabled={installing !== null}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-claw-600 hover:bg-claw-700 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                            >
                              {installing === req.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Download size={12} />
                              )}
                              <span>{t('dashboard.system.install')}</span>
                            </button>
                            <button
                              onClick={() => { setShowInstallPathInput(false); setInstallPath(''); }}
                              className="px-2 py-1.5 text-gray-400 hover:text-white text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => req.installAction?.()}
                            disabled={installing !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-claw-600 hover:bg-claw-700 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                          >
                            {installing === req.id ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                <span>{t('dashboard.system.installing')}</span>
                              </>
                            ) : (
                              <>
                                <Download size={12} />
                                <span>{t('dashboard.system.install')}</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                    {req.downloadUrl && req.id !== 'openclaw' && (
                      <button
                        onClick={() => handleOpenUrl(req.downloadUrl!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-gray-300 hover:text-white hover:bg-dark-500 rounded-lg transition-colors text-xs"
                        title={t('dashboard.system.download')}
                      >
                        <ExternalLink size={12} />
                        <span>{t('dashboard.system.download')}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* OpenClaw specify path section */}
            {req.id === 'openclaw' && !req.installed && (
              <div className="mt-2 pt-2 border-t border-dark-600">
                {!showSpecifyPath ? (
                  <button
                    onClick={() => setShowSpecifyPath(true)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-claw-400 transition-colors"
                  >
                    <FolderOpen size={12} />
                    <span>{t('dashboard.system.specifyPath')}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={specifyPath}
                      onChange={(e) => setSpecifyPath(e.target.value)}
                      placeholder={t('dashboard.system.specifyPathPlaceholder')}
                      className="flex-1 px-2 py-1 text-xs bg-dark-600 border border-dark-500 rounded text-white placeholder-gray-500"
                    />
                    <button
                      onClick={handleSpecifyPath}
                      className="px-3 py-1.5 bg-dark-500 hover:bg-dark-400 text-white rounded-lg transition-colors text-xs font-medium"
                    >
                      {t('dashboard.system.confirm')}
                    </button>
                    <button
                      onClick={() => { setShowSpecifyPath(false); setSpecifyPath(''); }}
                      className="px-2 py-1.5 text-gray-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
