// src/pages/PartDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Typography, Paper, Button,
    Divider, Chip, CircularProgress, Breadcrumbs, Link, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    Phone, ChevronLeft, Heart, User, Wrench, Layers,
    Trash2, CheckCircle, Pencil, MapPin
} from 'lucide-react';
import { api } from '../api/client';
import { getCurrentUser } from '../utils/authHelper';

const PartDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [part, setPart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showPhone, setShowPhone] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [soldDialogOpen, setSoldDialogOpen] = useState(false);

    const BASE_URL = 'https://localhost:7225';
    const currentUser = getCurrentUser();

    const isOwner = currentUser && part && (Number(part.sellerId) === Number(currentUser.id));

    useEffect(() => {
        setLoading(true);

        const requests = [api.get(`/SpareParts/${id}`)];

        if (currentUser) {
            requests.push(
                api.get(`/Favorites/spare-part/${id}/check`).catch(err => {
                    console.error("Ошибка при проверке статуса избранного запчасти:", err);
                    return { data: { isFavorite: false } };
                })
            );
        }

        Promise.all(requests)
            .then(([partRes, favRes]) => {
                setPart(partRes.data);
                if (favRes) {
                    setIsFavorite(favRes.data.isFavorite);
                }
                setActiveImageIndex(0);
            })
            .catch(err => {
                console.error("Ошибка загрузки данных запчасти:", err);
                if (err.response?.status === 404) {
                    navigate('/parts');
                }
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleToggleFavorite = async () => {
        if (!currentUser) {
            alert("Пожалуйста, войдите в аккаунт, чтобы добавлять запчасти в избранное.");
            return;
        }

        setFavLoading(true);
        try {
            const res = await api.post(`/Favorites/spare-part/${id}`);
            setIsFavorite(res.data.isFavorite);
        } catch (err) {
            console.error("Не удалось изменить статус избранного для запчасти:", err);
        } finally {
            setFavLoading(false);
        }
    };

    const handleMarkAsSold = async () => {
        try {
            const response = await api.patch(`/SpareParts/${id}/sold`);
            if (response.status === 200 || response.status === 204) {
                setSoldDialogOpen(false);
                window.location.reload();
            }
        } catch (error) {
            console.error("Ошибка при переводе запчасти в статус Продано:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/SpareParts/${id}`);
            if (response.status === 200 || response.status === 204) {
                setDeleteDialogOpen(false);
                navigate('/profile?tab=spare-parts');
            }
        } catch (error) {
            console.error("Ошибка при удалении объявления запчасти:", error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} color="success" />
            </Box>
        );
    }

    if (!part) return null;

    const techSpecs = [
        { label: 'Бренд авто', value: part.brandName },
        { label: 'Категория', value: part.categoryName },
        { label: 'Состояние', value: part.conditionName },
        { label: 'Дата публикации', value: new Date(part.createdAt).toLocaleDateString('ru-RU') },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
            <Breadcrumbs sx={{ mb: 2, color: 'text.secondary' }}>
                <Link component={RouterLink} to="/" underline="hover" color="inherit">Главная</Link>
                <Link component={RouterLink} to="/parts" underline="hover" color="inherit">Запчасти</Link>
                <Typography color="text.primary">{part.title}</Typography>
            </Breadcrumbs>

            <Button
                startIcon={<ChevronLeft size={18} />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, textTransform: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
                Назад к каталогу
            </Button>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>

                {/* ЛЕВАЯ КОЛОНКА */}
                <Box sx={{ width: { xs: '100%', md: '64%' }, flexShrink: 0 }}>
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                                {part.title}
                            </Typography>
                            <Chip
                                label={part.statusName || 'Активно'}
                                color={part.statusName === 'Продано' ? 'default' : part.statusName === 'На модерации' ? 'warning' : 'success'}
                                size="small"
                                sx={{ fontWeight: 700, borderRadius: '6px' }}
                            />
                        </Box>
                    </Box>

                    {/* Галерея изображений */}
                    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 3, p: 1, mb: 3, bgcolor: '#ffffff' }}>
                        <Box sx={{ width: '100%', height: { xs: '220px', sm: '360px' }, borderRadius: 2, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#0f172a' }}>
                            <img
                                src={part.images && part.images.length > 0 ? `${BASE_URL}${part.images[activeImageIndex]}` : 'https://via.placeholder.com/600x400?text=No+Photo'}
                                alt={part.title}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </Box>

                        {part.images && part.images.length > 1 && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', pb: 0.5 }}>
                                {part.images.map((img, idx) => (
                                    <Box
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        sx={{
                                            width: '70px', height: '50px', borderRadius: 1.5, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                                            border: activeImageIndex === idx ? '2.5px solid #2563eb' : '2px solid transparent',
                                            transition: 'all 0.1s ease',
                                        }}
                                    >
                                        <img src={`${BASE_URL}${img}`} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>

                    {/* Экспресс-плашки */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                                <Wrench size={20} color="#64748b" style={{ marginBottom: '4px' }} />
                                <Typography variant="caption" display="block" color="text.secondary">Для марки</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{part.brandName}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                                <Layers size={20} color="#64748b" style={{ marginBottom: '4px' }} />
                                <Typography variant="caption" display="block" color="text.secondary">Категория</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{part.categoryName}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Таблица характеристика */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Информация об объявлении</Typography>
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

                    {/* Описание */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Описание запчасти</Typography>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f8fafc', minHeight: '100px' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155' }}>
                            {part.description || "Продавец не оставил описания."}
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
                                    onClick={() => navigate(`/parts/${id}/edit`)}
                                    sx={{ bgcolor: '#475569', '&:hover': { bgcolor: '#334155' }, textTransform: 'none', fontWeight: 600 }}
                                >
                                    Редактировать
                                </Button>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    color="success"
                                    disabled={part.statusName === 'Продано'}
                                    startIcon={<CheckCircle size={16} />}
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
                                    {part.statusName === 'Продано' ? 'Продано' : 'Запчасть продана'}
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
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Цена</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5, mb: 3 }}>
                            {Number(part.priceByn).toLocaleString('ru-RU')} BYN
                        </Typography>

                        {/* Динамическая кнопка Избранного */}
                        {!isOwner && (
                            <Button
                                variant={isFavorite ? "outlined" : "contained"}
                                fullWidth
                                disabled={favLoading}
                                onClick={handleToggleFavorite}
                                startIcon={<Heart size={16} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#ffffff"} />}
                                sx={{
                                    fontWeight: 600,
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    mb: 3,
                                    ...(isFavorite ? {
                                        borderColor: '#ef4444',
                                        color: '#ef4444',
                                        '&:hover': { borderColor: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.04)' }
                                    } : {
                                        bgcolor: '#2563eb',
                                        '&:hover': { bgcolor: '#1d4ed8' }
                                    })
                                }}
                            >
                                {favLoading ? 'Сохранение...' : isFavorite ? 'В избранном' : 'В избранное'}
                            </Button>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>Продавец</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <User size={18} color="#64748b" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>{part.sellerName}</Typography>
                        </Box>

                        {showPhone ? (
                            <Button
                                variant="outlined"
                                color="success"
                                fullWidth
                                href={`tel:${part.sellerPhone}`}
                                startIcon={<Phone size={18} />}
                                sx={{ py: 1.2, borderRadius: 2, fontWeight: 700 }}
                            >
                                {part.sellerPhone || 'Телефон не указан'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                onClick={() => setShowPhone(true)}
                                startIcon={<Phone size={16} />}
                                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600, textTransform: 'none', bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                            >
                                Показать телефон
                            </Button>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* ДИАЛОГ: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Удалить объявление?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Вы действительно хотите безвозвратно удалить объявление о продаже запчасти "{part.title}"? Восстановить его будет невозможно.
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

            {/* ДИАЛОГ: ПОДТВЕРЖДЕНИЕ УСПЕШНОЙ ПРОДАЖИ */}
            <Dialog
                open={soldDialogOpen}
                onClose={() => setSoldDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Отметить как продано?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Статус объявления изменится на «Продано». Покупатели в общем каталоге увидят, что деталь больше недоступна.
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

export default PartDetailPage;