import  { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MapView from './pages/MapView';
import WaterAnalysis from './pages/WaterAnalysis';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/water-analysis" element={<WaterAnalysis />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
 