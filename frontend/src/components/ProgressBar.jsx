export default function ProgressBar({ percent = 0, label, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">{label}</span>
          <span className="text-sm font-bold text-blue-400">{percent}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
