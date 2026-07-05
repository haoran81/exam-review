interface CategoryBreakdownProps {
  data: { category: string; total: number; correct: number; accuracy: number }[];
}

function getBarColor(accuracy: number): string {
  if (accuracy >= 80) return 'bg-green-500';
  if (accuracy >= 50) return 'bg-indigo-500';
  return 'bg-amber-500';
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        暂无练习数据
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.category} className="flex items-center gap-3">
          {/* 分类名 */}
          <span className="w-20 flex-shrink-0 truncate text-sm font-medium text-slate-700">
            {item.category || '未分类'}
          </span>
          {/* 进度条 */}
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.accuracy)}`}
              style={{ width: `${Math.max(2, item.accuracy)}%` }}
            />
          </div>
          {/* 百分比 */}
          <span className="w-12 flex-shrink-0 text-right text-sm font-semibold text-slate-600">
            {Math.round(item.accuracy)}%
          </span>
        </div>
      ))}
    </div>
  );
}
