import { Activity, Cpu, HardDrive, Clock, Pencil, Check } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/tauri';

interface ServiceStatus {
  running: boolean;
  pid: number | null;
  port: number;
  uptime_seconds: number | null;
  memory_mb: number | null;
  cpu_percent: number | null;
}

interface StatusCardProps {
  status: ServiceStatus | null;
  loading: boolean;
  onPortChange?: () => void;
}

export function StatusCard({ status, loading, onPortChange }: StatusCardProps) {
  const { t } = useTranslation();
  const [editingPort, setEditingPort] = useState(false);
  const [portValue, setPortValue] = useState('');

  const formatUptime = (seconds: number | null) => {
    if (!seconds) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handlePortSave = async () => {
    const newPort = parseInt(portValue);
    if (newPort && newPort > 0 && newPort < 65536) {
      try {
        await api.saveGatewayPort(newPort);
        setEditingPort(false);
        onPortChange?.();
      } catch (e) {
        console.error('Failed to save port:', e);
      }
    }
  };

  const startEditPort = () => {
    setPortValue(String(status?.port || 18789));
    setEditingPort(true);
  };

  return (
    <div className="bg-dark-700 rounded-2xl p-6 border border-dark-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{t('dashboard.status.title')}</h3>
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'status-dot',
              loading ? 'warning' : status?.running ? 'running' : 'stopped'
            )}
          />
          <span
            className={clsx(
              'text-sm font-medium',
              loading
                ? 'text-yellow-400'
                : status?.running
                ? 'text-green-400'
                : 'text-red-400'
            )}
          >
            {loading ? t('dashboard.status.detecting') : status?.running ? t('dashboard.status.running') : t('dashboard.status.stopped')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 group">
        <div className="bg-dark-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-accent-cyan" />
            <span className="text-xs text-gray-400">{t('dashboard.status.port')}</span>
          </div>
          <div className="flex items-center gap-1">
            {editingPort ? (
              <>
                <input
                  type="number"
                  value={portValue}
                  onChange={(e) => setPortValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePortSave()}
                  className="w-20 px-2 py-1 text-xl font-semibold text-white bg-dark-500 border border-dark-400 rounded focus:outline-none focus:border-claw-500"
                  autoFocus
                />
                <button
                  onClick={handlePortSave}
                  className="p-1 text-green-400 hover:text-green-300"
                >
                  <Check size={16} />
                </button>
              </>
            ) : (
              <>
                <p className="text-xl font-semibold text-white">
                  {status?.port || 18789}
                </p>
                <button
                  onClick={startEditPort}
                  className="p-1 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil size={12} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-dark-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-accent-purple" />
            <span className="text-xs text-gray-400">{t('dashboard.status.pid')}</span>
          </div>
          <p className="text-xl font-semibold text-white">
            {status?.pid || '--'}
          </p>
        </div>

        <div className="bg-dark-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={16} className="text-accent-green" />
            <span className="text-xs text-gray-400">{t('dashboard.status.memory')}</span>
          </div>
          <p className="text-xl font-semibold text-white">
            {status?.memory_mb ? `${status.memory_mb.toFixed(1)} MB` : '--'}
          </p>
        </div>

        <div className="bg-dark-600 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-accent-amber" />
            <span className="text-xs text-gray-400">{t('dashboard.status.uptime')}</span>
          </div>
          <p className="text-xl font-semibold text-white">
            {formatUptime(status?.uptime_seconds || null)}
          </p>
        </div>
      </div>
    </div>
  );
}
