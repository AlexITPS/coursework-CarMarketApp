// src/pages/CarDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Typography, Paper, Button,
    Divider, Chip, CircularProgress, Breadcrumbs, Link, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    Phone, MapPin, Calendar, Gauge, Key,
    ChevronLeft, Fuel, Heart, User, Trash2, CheckCircle, Pencil
} from 'lucide-react';
import { api } from '../api/client';
import { getCurrentUser } from '../utils/authHelper'; 

const CarDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [usdRate, setUsdRate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showPhone, setShowPhone] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [soldDialogOpen, setSoldDialogOpen] = useState(false);

    const BASE_URL = 'https://localhost:7225';
    const currentUser = getCurrentUser();

    const isOwner = currentUser && car && (Number(car.sellerId) === Number(currentUser.id));

    useEffect(() => {
        setLoading(true);

        const requests = [
            api.get(`/CarAds/${id}`),
            api.get('/currency/rates').catch(err => {
                console.error("Не удалось загрузить курсы валют:", err);
                return { data: [] };
            })
        ];

        if (currentUser) {
            requests.push(
                api.get(`/Favorites/car/${id}/check`).catch(err => {
                    console.error("Ошибка при проверке статуса избранного:", err);
                    return { data: { isFavorite: false } }; 
                })
            );
        }

        Promise.all(requests)
            .then(([carRes, currencyRes, favRes]) => {
                setCar(carRes.data);

                const usd = currencyRes.data?.find(r => r.code === 'USD');
                if (usd) setUsdRate(usd);

                if (favRes) {
                    setIsFavorite(favRes.data?.isFavorite ?? favRes.data ?? false);
                }

                setActiveImageIndex(0);
            })
            .catch(err => {
                console.error("Ошибка загрузки данных автомобиля:", err);
                if (err.response?.status === 404) navigate('/cars');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleMarkAsSold = async () => {
        try {
            const response = await api.patch(`/CarAds/${id}/sold`);
            if (response.status === 200 || response.status === 204) {
                setSoldDialogOpen(false);

                setCar(prevCar => prevCar ? { ...prevCar, status: 'Продано' } : null);
            }
        } catch (error) {
            console.error("Ошибка при обновлении статуса:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/CarAds/${id}`);
            if (response.status === 200 || response.status === 204) {
                setDeleteDialogOpen(false);
                navigate('/profile?tab=my-ads'); 
            }
        } catch (error) {
            console.error("Ошибка при удалении:", error);
        }
    };

    const handleToggleFavorite = async () => {
        if (!currentUser) {
            alert("Пожалуйста, войдите в аккаунт, чтобы добавлять объявления в избранное.");
            return;
        }

        setFavLoading(true);
        try {
            const res = await api.post(`/Favorites/car/${id}`);

            setIsFavorite(res.data.isFavorite);
        } catch (err) {
            console.error("Не удалось изменить статус избранного:", err);
        } finally {
            setFavLoading(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
        </Box>
    );

    if (!car) return null;

    const calculateUsdPrice = () => {
        if (!car.priceByn) return 0;
        if (usdRate && usdRate.rate > 0) return car.priceByn * (usdRate.scale / usdRate.rate);
        return car.priceByn / 3.25;
    };

    const priceInUsd = calculateUsdPrice();
    const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(Math.round(num));

    const techSpecs = [
        { label: 'Год выпуска', value: `${car.year} г.` },
        { label: 'Пробег', value: `${car.mileage?.toLocaleString('ru-RU')} км` },
        { label: 'Тип двигателя', value: car.fuel },
        { label: 'Объем двигателя', value: car.engineVolume ? `${car.engineVolume.toFixed(1)} л.` : null },
        { label: 'Мощность', value: car.enginePower ? `${car.enginePower} л.с.` : null },
        { label: 'Емкость батареи', value: car.batteryCapacity ? `${car.batteryCapacity} кВт·ч` : null },
        { label: 'Коробка передач', value: car.transmission },
        { label: 'Тип кузова', value: car.body },
        { label: 'Привод', value: car.drive },
        { label: 'Состояние', value: car.condition },
    ].filter(spec => spec.value !== null && spec.value !== undefined);

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
            <Breadcrumbs sx={{ mb: 2, color: 'text.secondary' }}>
                <Link component={RouterLink} to="/" underline="hover" color="inherit">Главная</Link>
                <Link component={RouterLink} to="/cars" underline="hover" color="inherit">Каталог</Link>
                <Typography color="text.primary">{car.brandName} {car.modelName}</Typography>
            </Breadcrumbs>

            <Button
                startIcon={<ChevronLeft size={18} />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, textTransform: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
                Назад к объявлениям
            </Button>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>

                {/* ЛЕВАЯ КОЛОНКА */}
                <Box sx={{ width: { xs: '100%', md: '64%' }, flexShrink: 0 }}>
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                                {car.brandName} {car.modelName}, {car.year} г.
                            </Typography>
                            <Chip
                                label={car.status === 'Продано' ? 'Продано' : (car.status === 'Активно' ? 'Активно' : car.status)}
                                color={car.status === 'Продано' ? 'default' : car.status === 'На модерации' ? 'warning' : 'success'}
                                size="small"
                                sx={{ fontWeight: 700, borderRadius: '6px' }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MapPin size={16} />
                                <Typography variant="body2">г. {car.cityName}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Галерея */}
                    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 3, p: 1, mb: 3, bgcolor: '#ffffff' }}>
                        <Box sx={{ width: '100%', height: { xs: '220px', sm: '360px' }, borderRadius: 2, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#0f172a' }}>
                            <img
                                src={car.images && car.images.length > 0 ? `${BASE_URL}${car.images[activeImageIndex]}` : 'https://via.placeholder.com/600x400?text=No+Photo'}
                                alt={`${car.brandName} ${car.modelName}`}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </Box>
                        {car.images && car.images.length > 1 && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', pb: 0.5 }}>
                                {car.images.map((img, idx) => (
                                    <Box
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        sx={{
                                            width: '70px', height: '50px', borderRadius: 1.5, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                                            border: activeImageIndex === idx ? '2.5px solid #2563eb' : '2px solid transparent', transition: 'all 0.1s ease',
                                        }}
                                    >
                                        <img src={`${BASE_URL}${img}`} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>

                    {/* Характеристики (плитка) */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {[{ icon: <Gauge size={20} color="#64748b" />, label: 'Пробег', val: `${formatNumber(car.mileage)} км` },
                        { icon: <Fuel size={20} color="#64748b" />, label: 'Двигатель', val: car.fuel === 'Электро' ? 'Электро' : `${car.engineVolume?.toFixed(1)} л` },
                        { icon: <Key size={20} color="#64748b" />, label: 'КПП', val: car.transmission },
                        { icon: <Calendar size={20} color="#64748b" />, label: 'Привод', val: car.drive }].map((item, i) => (
                            <Grid item xs={6} sm={3} key={i}>
                                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                                    {item.icon}
                                    <Typography variant="caption" display="block" color="text.secondary">{item.label}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.val}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Характеристики</Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#ffffff' }}>
                        <Grid container rowSpacing={2.5} columnSpacing={6}>
                            {techSpecs.map((spec, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, py: 1, borderBottom: '1px solid #f1f5f9' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{spec.label}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{spec.value}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Комментарий продавца</Typography>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f8fafc', minHeight: '100px' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155' }}>
                            {car.description || "Продавец не оставил описания."}
                        </Typography>
                    </Paper>
                </Box>

                {/* ПРАВАЯ КОЛОНКА */}
                <Box sx={{ width: { xs: '100%', md: '36%' }, position: { md: 'sticky' }, top: '24px', flexShrink: 0 }}>

                    {/* ПАНЕЛЬ УПРАВЛЕНИЯ ВЛАДЕЛЬЦА */}
                    {isOwner && (
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#1e293b', color: '#ffffff', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                Управление объявлением
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<Pencil size={16} />}
                                    onClick={() => navigate(`/cars/${id}/edit`)}
                                    sx={{ bgcolor: '#475569', '&:hover': { bgcolor: '#334155' }, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Редактировать
                                </Button>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    color="success"
                                    disabled={car.status === 'Продано'}
                                    startIcon={car.status !== 'Продано' ? <CheckCircle size={16} /> : null}
                                    onClick={() => setSoldDialogOpen(true)}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        bgcolor: '#22c55e',
                                        '&:hover': { bgcolor: '#16a34a' },
                                        '&.Mui-disabled': {
                                            bgcolor: '#16a34a', 
                                            color: '#ffffff',
                                            opacity: 0.9
                                        }
                                    }}
                                >
                                    {car.status === 'Продано' ? 'Машина продана' : 'Отметить как проданную'}
                                </Button>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    color="error"
                                    startIcon={<Trash2 size={16} />}
                                    onClick={() => setDeleteDialogOpen(true)}
                                    sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
                                >
                                    Удалить объявление
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {/* Блок цены и контактов */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#ffffff' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Цена автомобиля</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5, mb: 0.5 }}>
                            {formatNumber(car.priceByn)} BYN
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 3 }}>
                            ≈ ${formatNumber(priceInUsd)}
                        </Typography>

                        {!isOwner && (
                            <Button
                                variant={isFavorite ? "outlined" : "contained"}
                                fullWidth
                                disabled={favLoading}
                                onClick={handleToggleFavorite}
                                startIcon={
                                    <Heart
                                        size={16}
                                        fill={isFavorite ? "#ef4444" : "transparent"}
                                        color={isFavorite ? "#ef4444" : "currentColor"}
                                    />
                                }
                                sx={{
                                    borderColor: isFavorite ? '#ef4444' : '#2563eb',
                                    bgcolor: isFavorite ? 'transparent' : '#2563eb',
                                    color: isFavorite ? '#ef4444' : '#ffffff',
                                    '&:hover': {
                                        bgcolor: isFavorite ? 'rgba(239, 68, 68, 0.05)' : '#1d4ed8',
                                        borderColor: isFavorite ? '#dc2626' : '#1d4ed8',
                                    },
                                    fontWeight: 600,
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    mb: 3
                                }}
                            >
                                {isFavorite ? 'В избранном' : 'Добавить в избранное'}
                            </Button>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>Продавец</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <User size={18} color="#64748b" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>{car.sellerName || 'Частное лицо'}</Typography>
                        </Box>

                        {showPhone ? (
                            <Button variant="outlined" color="success" fullWidth href={`tel:${car.sellerPhone}`} startIcon={<Phone size={18} />} sx={{ py: 1.2, borderRadius: 2, fontWeight: 700 }}>
                                {car.sellerPhone}
                            </Button>
                        ) : (
                            <Button variant="contained" color="success" fullWidth onClick={() => setShowPhone(true)} startIcon={<Phone size={16} />} sx={{ py: 1.2, borderRadius: 2, fontWeight: 600, textTransform: 'none', bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>
                                Показать телефон
                            </Button>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* ДИАЛОГ СЛУЖЕБНЫЙ: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Удалить объявление?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Вы действительно хотите безвозвратно удалить это объявление из базы данных CarMarket? Восстановить его или отменить это действие будет невозможно.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" color="primary" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
                        Отмена
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#dc2626', borderRadius: '8px' }}>
                        Да, удалить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ДИАЛОГ СЛУЖЕБНЫЙ: ПОДТВЕРЖДЕНИЕ ИЗМЕНЕНИЯ СТАТУСА (ПРОДАНО) */}
            <Dialog
                open={soldDialogOpen}
                onClose={() => setSoldDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Отметить автомобиль как проданный?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Статус объявления изменится на «Продано». Покупатели в каталоге увидят, что машина больше неактивна для продажи.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setSoldDialogOpen(false)} variant="outlined" color="primary" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
                        Отмена
                    </Button>
                    <Button onClick={handleMarkAsSold} variant="contained" color="success" sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' }, borderRadius: '8px' }}>
                        Да, продано!
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CarDetailPage;