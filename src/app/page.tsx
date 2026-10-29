'use client';

import { useState, useEffect } from 'react';
import BlockHeader from '@/components/BlockHeader';
import ApiDataTable from '@/components/ApiDataTable';
import FixedFieldCard from '@/components/FixedFieldCard';

interface ActionLog {
  id: number;
  action_type: string;
  entity_id: string | null;
  payload: Record<string, any>;
  created_at: string;
}

type JsonRecord = Record<string, unknown>;

export default function Home() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [taskRows, setTaskRows] = useState<JsonRecord[]>([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Загрузка существующих записей
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/actions');
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const fetchTask3 = async () => {
    setTaskLoading(true);
    setTaskError(null);
    try {
      const res = await fetch('/api/task3');
      const json = await res.json();
      if (json.success) {
        setTaskRows(json.data || []);
      } else {
        setTaskRows([]);
        setTaskError(json.error || 'Не удалось загрузить данные локального API');
      }
    } catch (err) {
      console.error('Failed to load task3 data:', err);
      setTaskRows([]);
      setTaskError('Не удалось загрузить данные локального API');
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchTask3();
  }, []);

  // Отправка нового действия в базу
  const trackAction = async (actionType: string, entityId?: string, extraData?: object) => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          entity_id: entityId || null,
          payload: {
            ...extraData,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Добавляем свежую запись наверх списка
        setLogs((prev) => [json.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to record action:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    trackAction('CUSTOM_INPUT_SUBMIT', 'FORM_INPUT', { value: inputVal });
    setInputVal('');
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-slate-700 pb-4">
          <h1 className="text-2xl font-bold">Панель отслеживания действий</h1>
          <p className="text-sm text-slate-400 mt-1">
            Тестовый интерфейс: генерация событий в браузере и фиксация в PostgreSQL
          </p>
        </header>

        <section className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
          <BlockHeader
            title="Данные локального API"
            description="Таблица из task_3 и четыре фиксированных поля (пока без источника)"
            onRefresh={fetchTask3}
            refreshing={taskLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FixedFieldCard label="Поле 1" />
            <FixedFieldCard label="Поле 2" />
            <FixedFieldCard label="Поле 3" />
            <FixedFieldCard label="Поле 4" />
          </div>

          <ApiDataTable rows={taskRows} loading={taskLoading} error={taskError} />
        </section>

        {/* Секция действий */}
        <section className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Инициировать действие:</h2>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => trackAction('BUTTON_CLICK', 'BTN_SUCCESS', { variant: 'green' })}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              Успешное действие (Green)
            </button>

            <button
              onClick={() => trackAction('BUTTON_CLICK', 'BTN_WARNING', { variant: 'amber' })}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              Предупреждение (Amber)
            </button>

            <button
              onClick={() => trackAction('FETCH_REMOTE_DATA', 'MOCK_API', { endpoint: '/api/mock-ping' })}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              Запрос к стороннему API
            </button>
          </div>

          <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Введите произвольный текст для отправки..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded font-medium text-sm transition disabled:opacity-50"
            >
              Отправить
            </button>
          </form>
        </section>

        {/* Таблица логов */}
        <section className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-200">Лог событий из PostgreSQL ({logs.length})</h2>
            <button
              onClick={fetchLogs}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Обновить вручную
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-700 rounded">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-700">ID</th>
                  <th className="px-4 py-3 border-b border-slate-700">Action Type</th>
                  <th className="px-4 py-3 border-b border-slate-700">Entity ID</th>
                  <th className="px-4 py-3 border-b border-slate-700">Payload</th>
                  <th className="px-4 py-3 border-b border-slate-700">Дата / Время</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 font-mono text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      Событий пока нет. Нажмите любую кнопку выше.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-750">
                      <td className="px-4 py-2 font-bold text-slate-400">{log.id}</td>
                      <td className="px-4 py-2 text-emerald-400 font-semibold">{log.action_type}</td>
                      <td className="px-4 py-2 text-amber-300">{log.entity_id || '-'}</td>
                      <td className="px-4 py-2 text-slate-300 max-w-xs truncate" title={JSON.stringify(log.payload)}>
                        {JSON.stringify(log.payload)}
                      </td>
                      <td className="px-4 py-2 text-slate-400">
                        {new Date(log.created_at).toLocaleTimeString('ru-RU')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}