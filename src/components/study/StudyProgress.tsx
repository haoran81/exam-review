interface StudyProgressProps {
  current: number; // 当前第几题（0-based）
  total: number;   // 总题数
}

export function StudyProgress({ current, total }: StudyProgressProps) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600">
          第 {current + 1}/{total} 题
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
