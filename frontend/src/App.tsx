import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuizApp from './pages/Quiz';
import Landing from './pages/Landing';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/quiz/:id" element={<QuizApp />} />
        <Route path="/" element={<Landing />} />

      </Routes>
    </Router>
  );
};

export default App;
