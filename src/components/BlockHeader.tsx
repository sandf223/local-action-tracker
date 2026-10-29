type BlockHeaderProps = {
  title: string;
  description?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export default function BlockHeader({
  title,
  description,
  onRefresh,
  refreshing = false,
}: BlockHeaderProps) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        {description ? (
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        ) : null}
      </div>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="text-xs text-blue-400 hover:text-blue-300 underline disabled:opacity-50 shrink-0"
        >
          {refreshing ? 'Обновление…' : 'Обновить'}
        </button>
      ) : null}
    </div>
  );
}
