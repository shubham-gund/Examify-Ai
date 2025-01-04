import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuizApp from './components/Quiz';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/quiz/:id" element={<QuizApp />} />
      </Routes>
    </Router>
  );
};

export default App;
