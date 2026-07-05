import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionActions } from '../../hooks/useQuestions';
import { parseImportJSON } from '../../utils/importParser';
import type { ImportResult } from '../../types';
import { Button } from '../shared/Button';

export function QuestionImporter() {
  const [jsonText, setJsonText] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const { bulkAdd } = useQuestionActions();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidate = () => {
    if (!jsonText.trim()) {
      setParseError('请先输入 JSON 内容');
      setResult(null);
      return;
    }

    const parsed = parseImportJSON(jsonText);
    setParseError(null);

    if (parsed.errors.length > 0) {
      setResult(parsed);
      return;
    }

    setResult(parsed);
  };

  const handleImport = async () => {
    if (!result || result.valid.length === 0) return;
    setImporting(true);
    try {
      await bulkAdd(result.valid);
      navigate('/questions');
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        setJsonText(content);
        setResult(null);
        setParseError(null);
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasErrors = result && result.errors.length > 0;
  const hasValid = result && result.errors.length === 0 && result.valid.length > 0;

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">导入题目</h2>
        <p className="mt-1 text-sm text-slate-500">
          支持 JSON 格式导入，格式参考下方示例
        </p>
      </div>

      {/* 文件选择 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
        />
      </div>

      {/* 文本域 */}
      <textarea
        className="w-full min-h-[200px] rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-y"
        placeholder={'[\n  {\n    "id": "abc123",\n    "type": "single-choice",\n    "category": "JavaScript",\n    ...\n  }\n]'}
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          setResult(null);
          setParseError(null);
        }}
        rows={10}
      />

      {/* 解析按钮 */}
      <Button onClick={handleValidate} variant="primary" disabled={!jsonText.trim()}>
        解析验证
      </Button>

      {/* 解析错误 */}
      {parseError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {parseError}
        </div>
      )}

      {/* 验证结果 */}
      {result && (
        <div className="space-y-3">
          {hasErrors && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm font-medium text-red-700 mb-2">
                验证失败，发现 {result.errors.length} 个错误：
              </p>
              <ul className="space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-sm text-red-600">
                    {err.index >= 0 ? `第 ${err.index + 1} 题：` : ''}
                    {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasValid && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm font-medium text-green-700">
                检测到 {result.valid.length} 道题目，格式正确
              </p>
            </div>
          )}

          {/* 题目预览 */}
          {hasValid && result.valid.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">题目预览：</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {result.valid.map((q, i) => (
                  <div
                    key={q.id ?? i}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 font-medium">
                        {q.category || '未分类'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {q.type === 'single-choice'
                          ? '单选'
                          : q.type === 'multi-choice'
                            ? '多选'
                            : q.type === 'fill-in-blank'
                              ? '填空'
                              : '简答'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{q.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 确认导入按钮 */}
          {hasValid && (
            <Button onClick={handleImport} variant="primary" disabled={importing}>
              {importing ? '导入中...' : `确认导入 (${result.valid.length} 题)`}
            </Button>
          )}
        </div>
      )}

      {/* 导入示例 */}
      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-600 select-none">
          📋 导入格式示例
        </summary>
        <pre className="px-4 pb-4 text-xs text-slate-500 font-mono whitespace-pre-wrap overflow-x-auto">
{`{
  "version": 1,
  "exportedAt": 1700000000000,
  "questions": [
    {
      "id": "abc123",
      "type": "single-choice",
      "category": "JavaScript",
      "tags": ["闭包"],
      "prompt": "以下关于闭包的描述正确的是？",
      "explanation": "闭包是指函数能访问其外部作用域中的变量...",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctIndex": 2,
      "createdAt": 1700000000000,
      "updatedAt": 1700000000000
    }
  ]
}`}
        </pre>
      </details>
    </div>
  );
}
