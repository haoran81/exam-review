// ============================================================
// 题目类型
// ============================================================

export type QuestionType =
  | 'single-choice'
  | 'multi-choice'
  | 'fill-in-blank'
  | 'short-answer';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  category: string;       // 分类，如 "JavaScript", "操作系统"
  tags: string[];          // 标签，用于筛选
  prompt: string;          // 题干
  explanation: string;     // 解析（答完后显示）
  createdAt: number;       // Date.now()
  updatedAt: number;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: string[];       // 所有选项
  correctIndex: number;    // 正确选项的索引
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi-choice';
  options: string[];
  correctIndices: number[]; // 所有正确选项的索引
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: 'fill-in-blank';
  acceptableAnswers: string[]; // 所有可接受的答案（大小写不敏感匹配）
  caseSensitive: boolean;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer';
  modelAnswer: string;     // 参考答案（自查用）
  keyPoints: string[];     // 关键得分点
}

export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | FillInBlankQuestion
  | ShortAnswerQuestion;

// ============================================================
// 刷题会话
// ============================================================

export interface StudyAnswer {
  questionId: string;
  selectedIndices?: number[];  // 选择题用
  textAnswer?: string;         // 填空/简答用
  isCorrect: boolean;          // 自动判分 or 自查
  answeredAt: number;
}

export interface StudySession {
  id: string;
  startedAt: number;
  completedAt?: number;
  questionIds: string[];       // 本次会话题目顺序
  answers: StudyAnswer[];
  category?: string;           // 可选：按分类刷题
  source: 'all' | 'wrong';     // 题目来源
}

// ============================================================
// 题目统计
// ============================================================

export interface QuestionStats {
  questionId: string;
  timesSeen: number;
  timesCorrect: number;
  lastAnsweredAt: number;
  streakCorrect: number;       // 连续正确次数
}

// ============================================================
// 导入/导出
// ============================================================

export interface QuestionImportFormat {
  version: 1;
  exportedAt: number;
  questions: Question[];
}

export interface ImportResult {
  valid: Question[];
  errors: { index: number; message: string }[];
}

// ============================================================
// 筛选条件
// ============================================================

export interface QuestionFilters {
  category?: string;
  type?: QuestionType;
  search?: string;
}
