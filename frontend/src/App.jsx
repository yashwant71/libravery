// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="library/:libraryName" element={<LibraryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
