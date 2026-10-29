type JsonRecord = Record<string, unknown>;

type ApiDataTableProps = {
  rows: JsonRecord[];
  loading?: boolean;
  error?: string | null;
};

function cellValue(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

export default function ApiDataTable({ rows, loading = false, error = null }: ApiDataTableProps) {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="overflow-x-auto border border-slate-700 rounded">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
          <tr>
            {columns.length === 0 ? (
              <th className="px-4 py-3 border-b border-slate-700">Данные</th>
            ) : (
              columns.map((col) => (
                <th key={col} className="px-4 py-3 border-b border-slate-700 whitespace-nowrap">
                  {col}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 font-mono text-xs">
          {loading ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className="px-4 py-6 text-center text-slate-500">
                Загрузка данных…
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className="px-4 py-6 text-center text-amber-400">
                {error}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className="px-4 py-6 text-center text-slate-500">
                Нет строк от локального API.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-700/40">
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-2 text-slate-300 max-w-xs truncate"
                    title={cellValue(row[col])}
                  >
                    {cellValue(row[col])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
