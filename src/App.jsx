import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ThankYou from './pages/ThankYou.jsx';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
