// src/pages/Favorites.jsx
import { Container, Typography, Box, CircularProgress, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import { Car, Settings, HeartCrack } from 'lucide-react';
import { api } from '../api/client';
import CarCard from '../components/CarCard';
import SparePartCard from '../components/SparePartCard';

const NoItemsMessage = ({ text }) => (
    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
        <HeartCrack size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {text}
        </Typography>
    </Paper>
);

const Favorites = () => {
    const [activeTab, setActiveTab] = useState('cars');
    const [cars, setCars] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const [carsRes, partsRes] = await Promise.all([
                api.get('/Favorites/cars'),
                api.get('/Favorites/spare-parts')
            ]);

            setCars(carsRes.data || []);
            setParts(partsRes.data || []);
        } catch (err) {
            console.error("Ошибка при загрузке избранного:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRemoveFromFavorites = (id, type) => {
        if (type === 'car') {
            setCars(prev => prev.filter(car => car.id !== id));
        } else {
            setParts(prev => prev.filter(part => part.id !== id));
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Избранные объявления
            </Typography>

            {/* Вкладки */}
            <Box sx={{ display: 'flex', gap: 4, borderBottom: '1px solid #e2e8f0', pb: 1, mb: 4 }}>
                <Box
                    onClick={() => setActiveTab('cars')}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', pb: 1,
                        borderBottom: activeTab === 'cars' ? '3px solid #0052cc' : '3px solid transparent',
                        color: activeTab === 'cars' ? '#0f172a' : '#64748b',
                        fontWeight: activeTab === 'cars' ? 700 : 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <Car size={20} />
                    <Typography variant="h6">Автомобили ({cars.length})</Typography>
                </Box>

                <Box
                    onClick={() => setActiveTab('parts')}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', pb: 1,
                        borderBottom: activeTab === 'parts' ? '3px solid #0052cc' : '3px solid transparent',
                        color: activeTab === 'parts' ? '#0f172a' : '#64748b',
                        fontWeight: activeTab === 'parts' ? 700 : 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <Settings size={20} />
                    <Typography variant="h6">Запчасти ({parts.length})</Typography>
                </Box>
            </Box>

            {/* Контент */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <>
                    {activeTab === 'cars' && (
                        cars.length === 0 ? (
                            <NoItemsMessage text="У вас нет избранных автомобилей" />
                        ) : (
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                                {cars.map((car) => (
                                    <CarCard
                                        key={car.id}
                                        car={car}
                                        isFavoritePage={true}
                                        onUnfavorite={() => handleRemoveFromFavorites(car.id, 'car')}
                                    />
                                ))}
                            </Box>
                        )
                    )}

                    {activeTab === 'parts' && (
                        parts.length === 0 ? (
                            <NoItemsMessage text="У вас нет избранных запчастей" />
                        ) : (
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                                {parts.map((part) => (
                                    <SparePartCard
                                        key={part.id}
                                        part={part}
                                        isFavoritePage={true}
                                        onUnfavorite={() => handleRemoveFromFavorites(part.id, 'part')}
                                    />
                                ))}
                            </Box>
                        )
                    )}
                </>
            )}
        </Container>
    );
};

export default Favorites;