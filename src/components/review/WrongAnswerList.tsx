import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWrongQuestions } from '../../hooks/useStudy';
import { db } from '../../db';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptyState } from '../shared/EmptyState';
import { QuestionCard } from '../questions/QuestionCard';

export function WrongAnswerList() {
  const navigate = useNavigate();
  const wrongQuestions = useWrongQuestions();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    setClearing(true);
    try {
      await db.studySessions.clear();
      await db.questionStats.clear();
    } finally {
      setClearing(false);
      setShowClearDialog(false);
    }
  };

  if (wrongQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <EmptyState
          icon="🎉"
          title="没有错题"
          description="继续保持！"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          错题本
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({wrongQuestions.length} 题)
          </span>
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={wrongQuestions.length === 0}
            onClick={() => navigate('/review/study')}
          >
            复习错题
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowClearDialog(true)}
          >
            清空记录
          </Button>
        </div>
      </div>

      {/* 错题列表 */}
      <div className="space-y-3">
        {wrongQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            showActions={false}
          />
        ))}
      </div>

      {/* 清空确认 */}
      <ConfirmDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClear}
        title="清空学习记录"
        message="确定要清空所有学习记录吗？此操作将清除所有刷题记录和错题数据，但不会删除题目本身。"
        confirmLabel={clearing ? '清空中...' : '确认清空'}
        danger
      />
    </div>
  );
}
