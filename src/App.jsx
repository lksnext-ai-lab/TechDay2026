import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './modules/chat/Chat';
import Sat from './modules/sat/Sat';
import Ocr from './modules/ocr/Ocr';
import Sorteo from './modules/sorteo/Sorteo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="chat" element={<Chat />} />
          <Route path="sat" element={<Sat />} />
          <Route path="ocr" element={<Ocr />} />
          <Route path="sorteo" element={<Sorteo />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
