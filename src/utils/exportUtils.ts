import type { Question, QuestionImportFormat } from '../types';
import { db } from '../db';

/** 导出所有题目为 JSON 字符串 */
export async function exportAllQuestions(): Promise<string> {
  const questions: Question[] = await db.questions.toArray();
  const data: QuestionImportFormat = {
    version: 1,
    exportedAt: Date.now(),
    questions,
  };
  return JSON.stringify(data, null, 2);
}

/** 触发浏览器下载 JSON 文件 */
export function downloadJSON(jsonString: string, filename: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
