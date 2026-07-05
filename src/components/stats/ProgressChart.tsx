interface ProgressChartProps {
  accuracy: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 160,
} as const;

function getColor(accuracy: number): string {
  if (accuracy >= 80) return '#22c55e'; // green
  if (accuracy >= 50) return '#4f46e5'; // indigo
  return '#f59e0b'; // amber
}

export function ProgressChart({ accuracy, size = 'md' }: ProgressChartProps) {
  const px = sizeMap[size];
  const innerPx = px * 0.7;
  const trackColor = '#e2e8f0';
  const fillColor = getColor(accuracy);
  const clampedAccuracy = Math.max(0, Math.min(100, accuracy));

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: px, height: px }}
    >
      {/* 外层圆环 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${fillColor} ${clampedAccuracy * 3.6}deg, ${trackColor} 0)`,
          mask: 'radial-gradient(transparent 60%, black 61%)',
          WebkitMask: 'radial-gradient(transparent 60%, black 61%)',
        }}
      />
      {/* 内层镂空 + 百分比文字 */}
      <div
        className="absolute flex items-center justify-center rounded-full bg-white"
        style={{ width: innerPx, height: innerPx }}
      >
        <span
          className="font-bold"
          style={{
            fontSize: px * 0.22,
            color: fillColor,
          }}
        >
          {Math.round(clampedAccuracy)}%
        </span>
      </div>
    </div>
  );
}
