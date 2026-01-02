import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './modules/chat/Chat';
import Sat from './modules/sat/Sat';
import Ocr from './modules/ocr/Ocr';
import Sorteo from './modules/sorteo/Sorteo';
import { ConfigProvider } from './context/ConfigContext';
import ConfigPage from './pages/ConfigPage';

function App() {
  return (
    <Router>
      <ConfigProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="chat" element={<Chat />} />
            <Route path="sat" element={<Sat />} />
            <Route path="ocr" element={<Ocr />} />
            <Route path="sorteo" element={<Sorteo />} />
          </Route>
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
      </ConfigProvider>
    </Router>
  );
}

export default App;
