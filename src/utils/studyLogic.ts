import type { Question, StudyAnswer } from '../types';

/** Fisher-Yates 洗牌算法 — 返回新数组 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 判断题目的作答是否正确 */
export function checkAnswer(question: Question, answer: StudyAnswer): boolean {
  switch (question.type) {
    case 'single-choice':
      return answer.selectedIndices !== undefined
        && answer.selectedIndices.length === 1
        && answer.selectedIndices[0] === question.correctIndex;

    case 'multi-choice':
      if (!answer.selectedIndices) return false;
      const correct = new Set(question.correctIndices);
      const selected = new Set(answer.selectedIndices);
      return correct.size === selected.size
        && [...correct].every(i => selected.has(i));

    case 'fill-in-blank': {
      if (!answer.textAnswer) return false;
      const input = answer.textAnswer.trim();
      const normalized = question.caseSensitive ? input : input.toLowerCase();
      return question.acceptableAnswers.some(a => {
        const accept = question.caseSensitive ? a : a.toLowerCase();
        return normalized === accept;
      });
    }

    case 'short-answer':
      // 简答题无自动判分，永远返回 false（用户自查后手动标记）
      return false;

    default:
      return false;
  }
}

/** 计算单次会话的得分统计 */
export function calcSessionScore(answers: StudyAnswer[]): {
  total: number;
  correct: number;
} {
  const total = answers.length;
  const correct = answers.filter(a => a.isCorrect).length;
  return { total, correct };
}

/** 判断一道题是否属于自动判分类型 */
export function isAutoGraded(type: string): boolean {
  return type === 'single-choice' || type === 'multi-choice' || type === 'fill-in-blank';
}
