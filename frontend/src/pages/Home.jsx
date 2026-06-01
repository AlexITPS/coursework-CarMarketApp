import { Container, Typography, Paper, Box, Button, Link, CircularProgress, Dialog, DialogContent, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Search, Car, Settings, Calendar, User, ArrowRight, X } from 'lucide-react';
import { api } from '../api/client';
import CarCard from '../components/CarCard';
import SparePartCard from '../components/SparePartCard';

const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('cars');

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [news, setNews] = useState([]);
    const [totalCars, setTotalCars] = useState(0);
    const [totalParts, setTotalParts] = useState(0);

    const [cars, setCars] = useState([]);
    const [loadingCars, setLoadingCars] = useState(false);
    const [parts, setParts] = useState([]);
    const [loadingParts, setLoadingParts] = useState(false);

    // Состояние для открытия модального окна просмотра новости
    const [selectedNews, setSelectedNews] = useState(null);

    const pageSize = 6;

    // Функция для безопасного формирования URL картинок (убирает /api, если он есть в VITE_API_URL)
    const getFullImageUrl = (imgUrl) => {
        if (!imgUrl) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
        if (imgUrl.startsWith('http')) return imgUrl;

        // Берем адрес бэка из окружения или ставим актуальный порт из твоего Swagger (7225)
        const backendUrl = import.meta.env.VITE_API_URL || 'https://localhost:7225';

        // Удаляем '/api' с конца URL, так как статические файлы (uploads) раздаются из корня бэкенда
        const baseUrl = backendUrl.replace(/\/api$/, '');

        return `${baseUrl}${imgUrl}`;
    };

    const fetchLatestCars = () => {
        setLoadingCars(true);
        api.get('/CarAds', { params: { PageNumber: 1, PageSize: pageSize } })
            .then(res => {
                setCars(res.data.items || []);
                setTotalCars(res.data.totalCount || 0);
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingCars(false));
    };

    const fetchLatestParts = () => {
        setLoadingParts(true);
        api.get('/SpareParts', { params: { PageNumber: 1, PageSize: pageSize } })
            .then(res => {
                setParts(res.data.items || []);
                setTotalParts(res.data.totalCount || 0);
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingParts(false));
    };

    useEffect(() => {
        if (activeTab === 'cars') fetchLatestCars();
        else if (activeTab === 'parts') fetchLatestParts();
    }, [activeTab]);

    useEffect(() => {
        api.get('/Directory/brands').then(res => setBrands(res.data)).catch(err => console.error(err));
        api.get('/Directory/spare-categories').then(res => setCategories(res.data)).catch(err => console.error(err));

        // Подгружаем последние 3 новости (передаем параметр из Swagger, чтобы не тянуть архивные)
        api.get('/News', { params: { includeArchived: false } })
            .then(res => {
                // Т.к. бэкенд возвращает сразу массив, берем res.data напрямую
                const newsArray = Array.isArray(res.data) ? res.data : [];
                setNews(newsArray.slice(0, 3));
            })
            .catch(err => console.error(err));
    }, []);

    const handleNavigateToCatalog = () => {
        if (activeTab === 'cars') navigate('/cars');
        else navigate('/parts');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* 1. Главная плашка счетчика */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: '#1a1d24', color: 'white', borderRadius: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.5px' }}>
                    {activeTab === 'cars'
                        ? `Поиск среди ${totalCars} объявлений о продаже авто`
                        : `Поиск среди ${totalParts} объявлений о продаже запчастей`
                    }
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7, mb: 3 }}>
                    car-market.by — проверенные машины и запчасти в Беларуси
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        bgcolor: '#242933',
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ pl: 1 }}>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            {activeTab === 'cars'
                                ? "Используйте точные фильтры для подбора автомобиля"
                                : "Перейдите в каталог для поиска деталей по категориям"
                            }
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="text"
                            startIcon={<SlidersHorizontal size={16} />}
                            onClick={handleNavigateToCatalog}
                            sx={{ color: '#94a3b8', '&:hover': { color: 'white' }, textTransform: 'none' }}
                        >
                            Все параметры поиска
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Search size={16} />}
                            onClick={handleNavigateToCatalog}
                            sx={{ px: 4, borderRadius: 2, bgcolor: '#0052cc', textTransform: 'none', fontWeight: 600 }}
                        >
                            {activeTab === 'cars' ? `Показать ${totalCars} объявлений` : `Показать ${totalParts} запчастей`}
                        </Button>
                    </Box>
                </Paper>
            </Paper>

            {/* Вкладки */}
            <Box sx={{ display: 'flex', gap: 4, borderBottom: '1px solid #e2e8f0', pb: 1, mb: 3 }}>
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
                    <Typography variant="h6">Авто с пробегом</Typography>
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
                    <Typography variant="h6">Запчасти</Typography>
                </Box>
            </Box>

            {/* Сетка для марок */}
            <Box sx={{ minHeight: '120px', mb: 4 }}>
                {brands.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        Данные загружаются или бэкенд выключен...
                    </Typography>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: '16px 24px' }}>
                        {brands.map((brand) => {
                            const linkHref = activeTab === 'cars' ? `/cars?brandId=${brand.id}` : `/parts?brandId=${brand.id}`;
                            return (
                                <Box key={brand.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px dashed #e2e8f0', pb: 0.5 }}>
                                    <Link component={RouterLink} to={linkHref} underline="hover" color="text.primary" sx={{ fontWeight: 500, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { color: '#0052cc' } }}>
                                        {brand.name}
                                    </Link>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', ml: 1 }}>•</Typography>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* СЕКЦИЯ ОБЪЯВЛЕНИЙ АВТО */}
            {activeTab === 'cars' && (
                <Box sx={{ mt: 4, mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>Самые интересные авто</Typography>
                    {loadingCars ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress color="primary" /></Box>
                    ) : cars.length === 0 ? (
                        <Typography variant="body1" color="text.secondary">Объявлений пока нет.</Typography>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 2 }}>
                            {cars.map((car) => <CarCard key={car.id} car={car} />)}
                        </Box>
                    )}
                </Box>
            )}

            {/* СЕКЦИЯ ЗАПЧАСТЕЙ */}
            {activeTab === 'parts' && (
                <Box sx={{ mt: 4, mb: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>Свежие предложения по запчастям</Typography>
                    {loadingParts ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress color="primary" /></Box>
                    ) : parts.length === 0 ? (
                        <Typography variant="body1" color="text.secondary">Запчастей пока нет.</Typography>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 2 }}>
                            {parts.map((part) => <SparePartCard key={part.id} part={part} />)}
                        </Box>
                    )}
                </Box>
            )}

            {/* СЕКЦИЯ НОВОСТЕЙ */}
            <Box sx={{ mt: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        Автомобильный журнал
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/news"
                        endIcon={<ArrowRight size={16} />}
                        sx={{ textTransform: 'none', color: '#0052cc', fontWeight: 600, '&:hover': { bgcolor: 'rgba(0, 82, 204, 0.04)' } }}
                    >
                        Все новости
                    </Button>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {news.map((item) => {
                        const mainImg = item.images?.find(i => i.isMain)?.url || item.images?.[0]?.url;
                        const fullImgUrl = getFullImageUrl(mainImg);

                        return (
                            <Paper
                                key={item.id}
                                onClick={() => setSelectedNews(item)}
                                sx={{
                                    height: '100%',
                                    borderRadius: 3,
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 12px 20px -4px rgba(0, 0, 0, 0.08)',
                                        borderColor: '#cbd5e1',
                                        '& .news-title': { color: '#0052cc' }
                                    }
                                }}
                                elevation={0}
                            >
                                {/* Превью картинки */}
                                <Box sx={{ width: '100%', height: 180, overflow: 'hidden', bgcolor: '#f1f5f9', position: 'relative' }}>
                                    <img
                                        src={fullImgUrl}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            // Фолбэк на случай, если картинка всё равно упадет
                                            e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
                                        }}
                                    />
                                </Box>

                                {/* Контентная часть */}
                                <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Мета-информация */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                                            <Calendar size={14} />
                                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : 'Недавно'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                                            <User size={14} />
                                            <Typography variant="caption" sx={{ fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.authorName}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography
                                        className="news-title"
                                        variant="subtitle1"
                                        sx={{ fontWeight: 700, mb: 1, lineHeight: 1.4, color: '#0f172a', transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8em' }}
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2, lineHeight: 1.5 }}
                                    >
                                        {item.content || 'Без описания'}
                                    </Typography>

                                    <Box sx={{ mt: 'auto', pt: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#0052cc', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            Читать полностью →
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            </Box>

            {/* МОДАЛЬНОЕ ОКНО ПРОСМОТРА НОВОСТИ */}
            <Dialog
                open={Boolean(selectedNews)}
                onClose={() => setSelectedNews(null)}
                maxWidth="md"
                fullWidth
                scroll="body"
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                {selectedNews && (() => {
                    const mainImg = selectedNews.images?.find(i => i.isMain)?.url || selectedNews.images?.[0]?.url;
                    const fullImgUrl = getFullImageUrl(mainImg);

                    return (
                        <Box sx={{ position: 'relative' }}>
                            <IconButton
                                onClick={() => setSelectedNews(null)}
                                sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' }, zIndex: 10 }}
                            >
                                <X size={20} />
                            </IconButton>

                            <Box sx={{ width: '100%', maxHeight: 400, overflow: 'hidden', bgcolor: '#0f172a' }}>
                                <img
                                    src={fullImgUrl}
                                    alt={selectedNews.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
                                    }}
                                />
                            </Box>

                            <DialogContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, color: '#64748b' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Calendar size={16} />
                                        <Typography variant="body2">{new Date(selectedNews.createdAt).toLocaleDateString('ru-RU')}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <User size={16} />
                                        <Typography variant="body2">{selectedNews.authorName}</Typography>
                                    </Box>
                                </Box>

                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#0f172a', lineHeight: 1.3 }}>
                                    {selectedNews.title}
                                </Typography>

                                <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                                    {selectedNews.content}
                                </Typography>
                            </DialogContent>
                        </Box>
                    );
                })()}
            </Dialog>
        </Container>
    );
};

export default Home;