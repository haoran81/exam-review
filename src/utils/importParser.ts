import type { Question, QuestionImportFormat, ImportResult } from '../types';

const REQUIRED_BASE_FIELDS = ['id', 'type', 'category', 'tags', 'prompt', 'explanation'] as const;

const VALID_TYPES = ['single-choice', 'multi-choice', 'fill-in-blank', 'short-answer'];

function validateBase(q: Record<string, unknown>, index: number): string | null {
  for (const field of REQUIRED_BASE_FIELDS) {
    if (q[field] === undefined || q[field] === null) {
      return `题目 #${index + 1}: 缺少必填字段 "${field}"`;
    }
  }

  if (!VALID_TYPES.includes(q.type as string)) {
    return `题目 #${index + 1}: 无效的题型 "${q.type}"，支持的类型: ${VALID_TYPES.join(', ')}`;
  }

  if (!Array.isArray(q.tags)) {
    return `题目 #${index + 1}: "tags" 必须是数组`;
  }

  if (typeof q.prompt !== 'string' || !q.prompt.trim()) {
    return `题目 #${index + 1}: "prompt" 不能为空`;
  }

  return null;
}

function validateChoice(q: Record<string, unknown>, index: number): string | null {
  const type = q.type as string;
  if (!Array.isArray(q.options) || q.options.length < 2) {
    return `题目 #${index + 1}: "options" 至少需要 2 个选项`;
  }

  if (type === 'single-choice') {
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= (q.options as string[]).length) {
      return `题目 #${index + 1}: "correctIndex" 必须在选项范围内`;
    }
  }

  if (type === 'multi-choice') {
    if (!Array.isArray(q.correctIndices) || q.correctIndices.length === 0) {
      return `题目 #${index + 1}: "correctIndices" 必须是非空数组`;
    }
    const len = (q.options as string[]).length;
    for (const idx of q.correctIndices as number[]) {
      if (typeof idx !== 'number' || idx < 0 || idx >= len) {
        return `题目 #${index + 1}: "correctIndices" 中包含无效索引 ${idx}`;
      }
    }
  }

  return null;
}

function validateFillInBlank(q: Record<string, unknown>, index: number): string | null {
  if (!Array.isArray(q.acceptableAnswers) || q.acceptableAnswers.length === 0) {
    return `题目 #${index + 1}: "acceptableAnswers" 必须是非空数组`;
  }
  return null;
}

function validateShortAnswer(q: Record<string, unknown>, index: number): string | null {
  if (typeof q.modelAnswer !== 'string' || !q.modelAnswer.trim()) {
    return `题目 #${index + 1}: "modelAnswer" 不能为空`;
  }
  return null;
}

function validateQuestion(q: Record<string, unknown>, index: number): string | null {
  const baseErr = validateBase(q, index);
  if (baseErr) return baseErr;

  const type = q.type as string;
  switch (type) {
    case 'single-choice':
    case 'multi-choice':
      return validateChoice(q, index);
    case 'fill-in-blank':
      return validateFillInBlank(q, index);
    case 'short-answer':
      return validateShortAnswer(q, index);
    default:
      return `题目 #${index + 1}: 未知题型 "${type}"`;
  }
}

/** 解析并验证导入的 JSON 数据 */
export function parseImportJSON(jsonString: string): ImportResult {
  let data: QuestionImportFormat;

  try {
    data = JSON.parse(jsonString);
  } catch {
    return { valid: [], errors: [{ index: -1, message: 'JSON 格式无效，请检查语法' }] };
  }

  if (!data.version || !Array.isArray(data.questions)) {
    return { valid: [], errors: [{ index: -1, message: '数据格式不正确：需要 { version: 1, questions: [...] }' }] };
  }

  const valid: Question[] = [];
  const errors: ImportResult['errors'] = [];

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i] as unknown as Record<string, unknown>;
    const err = validateQuestion(q, i);
    if (err) {
      errors.push({ index: i, message: err });
    } else {
      valid.push(data.questions[i]);
    }
  }

  return { valid, errors };
}
