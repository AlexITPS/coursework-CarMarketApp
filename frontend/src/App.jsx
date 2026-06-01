// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetailPage from './pages/CarDetailPage';
import PartsPage from './pages/PartsPage';
import PartDetailPage from './pages/PartDetailPage';
import CreateCarPage from './pages/CreateCarPage';
import CreateSparePartPage from './pages/CreateSparePartPage';
import ConverterPage from './pages/ConverterPage';
import ProfilePage from './pages/ProfilePage';
import EditCarPage from './pages/EditCarPage';
import EditSparePartPage from './pages/EditSparePartPage';
import Favorites from './pages/Favorites';
import News from './pages/News'; 

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Header />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/cars" element={<Cars />} />
                            <Route path="/cars/:id" element={<CarDetailPage />} />
                            <Route path="/parts" element={<PartsPage />} />
                            <Route path="/parts/:id" element={<PartDetailPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/create-ad/car" element={<CreateCarPage />} />
                            <Route path="/cars/:id/edit" element={<EditCarPage />} />
                            <Route path="/create-ad/spare-part" element={<CreateSparePartPage />} />
                            <Route path="/converter" element={<ConverterPage />} />
                            <Route path="/parts/:id/edit" element={<EditSparePartPage />} />
                            <Route path="/favorites" element={<Favorites />} />
                            <Route path="/news" element={<News />} />
                        </Routes>
                    </Box>
                    <Footer />
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;