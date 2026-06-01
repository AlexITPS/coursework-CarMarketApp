// src/pages/News.jsx
import { Container, Typography, Box, Paper, CircularProgress, Dialog, DialogContent, IconButton, Breadcrumbs, Link, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Calendar, User, X, Newspaper, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedNews, setSelectedNews] = useState(null);

    const getFullImageUrl = (imgUrl) => {
        if (!imgUrl) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
        if (imgUrl.startsWith('http')) return imgUrl;

        const backendUrl = import.meta.env.VITE_API_URL || 'https://localhost:7225';
        const baseUrl = backendUrl.replace(/\/api$/, '');

        return `${baseUrl}${imgUrl}`;
    };

    const fetchNews = () => {
        setLoading(true);
        setError(null);
        api.get('/News', { params: { includeArchived: false } })
            .then(res => setNews(res.data || []))
            .catch(err => {
                console.error("Ошибка при загрузке новостей:", err);
                setError("Не удалось загрузить новости. Пожалуйста, попробуйте позже.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Breadcrumbs separator="•" sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: '#cbd5e1' } }}>
                <Link component={RouterLink} to="/" underline="hover" color="text.secondary" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    Главная
                </Link>
                <Typography color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    Журнал
                </Typography>
            </Breadcrumbs>

            {/* Заголовок страницы */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.75px', mb: 1 }}>
                    Автомобильные новости
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    События авторынка, полезные обзоры и важные обновления в Беларуси
                </Typography>
            </Box>

            {/* Тело страницы */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : error ? (
                <Paper elevation={0} sx={{ p: 5, textAlign: 'center', bgcolor: '#fff5f5', borderRadius: 3, border: '1px dashed #feb2b2' }}>
                    <AlertCircle size={40} color="#f56565" style={{ marginBottom: '12px' }} />
                    <Typography variant="body1" color="error.main" sx={{ fontWeight: 500, mb: 2 }}>
                        {error}
                    </Typography>
                    <Button variant="outlined" color="error" onClick={fetchNews} size="small">
                        Повторить попытку
                    </Button>
                </Paper>
            ) : news.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                    <Newspaper size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        На данный момент нет опубликованных новостей.
                    </Typography>
                </Paper>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 3
                    }}
                >
                    {news.map((item) => {
                        const mainImg = item.images?.find(i => i.isMain)?.url || item.images?.[0]?.url;
                        const fullImgUrl = getFullImageUrl(mainImg);

                        return (
                            <Paper
                                key={item.id}
                                onClick={() => setSelectedNews(item)}
                                sx={{
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
                                        '& .news-page-title': { color: '#0052cc' }
                                    }
                                }}
                                elevation={0}
                            >
                                <Box sx={{ width: '100%', height: 200, overflow: 'hidden', bgcolor: '#f1f5f9' }}>
                                    <img
                                        src={fullImgUrl}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
                                        }}
                                    />
                                </Box>

                                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, color: '#64748b' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Calendar size={14} />
                                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : 'Недавно'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <User size={14} />
                                            <Typography variant="caption" sx={{ fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.authorName || 'Редакция'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography
                                        className="news-page-title"
                                        variant="h6"
                                        sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3, color: '#0f172a', transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.6em' }}
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2, lineHeight: 1.6 }}
                                    >
                                        {item.content || 'Без описания'}
                                    </Typography>

                                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                                        <Typography variant="body2" sx={{ color: '#0052cc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            Читать статью →
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            )}

            {/* ОКНО ПРОСМОТРА ПОЛНОЙ СТАТЬИ */}
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

                            <Box sx={{ width: '100%', height: { xs: 240, sm: 380, md: 420 }, overflow: 'hidden', bgcolor: '#0f172a' }}>
                                <img
                                    src={fullImgUrl}
                                    alt={selectedNews.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
                                    }}
                                />
                            </Box>

                            <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, color: '#64748b' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Calendar size={16} />
                                        <Typography variant="body2">
                                            {selectedNews.createdAt ? new Date(selectedNews.createdAt).toLocaleDateString('ru-RU') : 'Недавно'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <User size={16} />
                                        <Typography variant="body2">
                                            {selectedNews.authorName || 'Редакция'}
                                        </Typography>
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

export default News;