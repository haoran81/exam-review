import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': '📊 学习概览',
  '/questions': '📚 题库',
  '/questions/new': '✏️ 新建题目',
  '/questions/import': '📥 导入题目',
  '/study': '📝 开始刷题',
  '/review': '🔁 错题本',
  '/review/study': '🔁 错题复习',
  '/stats': '📈 详细统计',
};

export function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? '📖 刷题助手';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
    </header>
  );
}
