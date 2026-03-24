export default function LoadingSpinner({ message = 'Loading…', size = 'md' }) {
  const sizeCls = size === 'lg' ? 'w-16 h-16 border-4' : 'w-8 h-8 border-2';
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className={`${sizeCls} rounded-full border-blue-500/30 border-t-blue-500 animate-spin`}
      />
      <p className="text-slate-400 text-sm animate-pulse">{message}</p>
    </div>
  );
}
