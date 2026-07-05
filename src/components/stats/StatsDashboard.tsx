import { useNavigate } from 'react-router-dom';
import { useOverallStats, useCategoryAccuracy } from '../../hooks/useStats';
import { useSessionHistory } from '../../hooks/useStudy';

import { exportAllQuestions, downloadJSON } from '../../utils/exportUtils';
import { Button } from '../shared/Button';
import { EmptyState } from '../shared/EmptyState';
import { ProgressChart } from './ProgressChart';
import { CategoryBreakdown } from './CategoryBreakdown';

export function StatsDashboard() {
  const navigate = useNavigate();
  const stats = useOverallStats();
  const categoryData = useCategoryAccuracy();

  const history = useSessionHistory(5);

  const handleExport = async () => {
    const json = await exportAllQuestions();
    downloadJSON(json, `exam-review-backup-${Date.now()}.json`);
  };

  // 空状态：无题目时
  if (stats.totalQuestions === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <EmptyState
          icon="📚"
          title="还没有题目"
          description="先导入或创建题目开始学习吧"
        />
        <div className="flex gap-3 mt-6">
          <Button onClick={() => navigate('/questions/new')} variant="primary">
            新建题目
          </Button>
          <Button onClick={() => navigate('/questions/import')} variant="secondary">
            导入题目
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* 问候语 */}
      <h2 className="text-2xl font-bold text-slate-800">👋 今天也要加油！</h2>

      {/* 4 个统计卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="题目总数" value={stats.totalQuestions} />
        <StatCard label="练习次数" value={stats.totalSessions} />
        <StatCard label="正确率" value={`${Math.round(stats.accuracy)}%`} />
        <StatCard label="错题数" value={stats.wrongCount} />
      </div>

      {/* 正确率环 */}
      <div className="flex justify-center py-2">
        <ProgressChart accuracy={stats.accuracy} size="lg" />
      </div>

      {/* 分类准确率 */}
      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-3">分类掌握情况</h3>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <CategoryBreakdown data={categoryData} />
        </div>
      </section>

      {/* 最近练习历史 */}
      {history.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-slate-700 mb-3">最近练习</h3>
          <div className="space-y-2">
            {history.map(({ session }) => {
              const total = session.answers.length;
              const correct = session.answers.filter((a) => a.isCorrect).length;
              const dateStr = new Date(session.completedAt ?? session.startedAt).toLocaleString(
                'zh-CN',
                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
              );

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-3"
                >
                  <span className="text-sm text-slate-500">{dateStr}</span>
                  <span className="text-sm font-medium text-slate-700">
                    {correct}/{total} 正确
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 快捷操作 */}
      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-3">快捷操作</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/study')} variant="primary">
            开始刷题
          </Button>
          <Button onClick={() => navigate('/questions/import')} variant="secondary">
            导入题库
          </Button>
          <Button onClick={handleExport} variant="secondary">
            备份导出
          </Button>
        </div>
      </section>
    </div>
  );
}

/** 单个统计卡片 */
function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-5 text-center">
      <p className="text-3xl font-bold text-indigo-600">{value}</p>
      <p className="mt-1 text-xs text-indigo-400">{label}</p>
    </div>
  );
}
