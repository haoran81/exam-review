import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { QuestionList } from './components/questions/QuestionList';
import { QuestionEditor } from './components/questions/QuestionEditor';
import { QuestionImporter } from './components/questions/QuestionImporter';
import { StudySession } from './components/study/StudySession';
import { WrongAnswerList } from './components/review/WrongAnswerList';

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<StatsDashboard />} />
          <Route path="/questions" element={<QuestionList />} />
          <Route path="/questions/new" element={<QuestionEditor />} />
          <Route path="/questions/:id/edit" element={<QuestionEditor />} />
          <Route path="/questions/import" element={<QuestionImporter />} />
          <Route path="/study" element={<StudySession />} />
          <Route path="/review" element={<WrongAnswerList />} />
          <Route path="/review/study" element={<StudySession />} />
          <Route path="/stats" element={<StatsDashboard />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
