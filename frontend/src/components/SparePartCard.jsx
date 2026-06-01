// src/components/SparePartCard.jsx
import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SparePartCard = ({ part, isMyAd = false }) => {
    const navigate = useNavigate();
    const baseUrl = 'https://localhost:7225';

    const mainImage = part.images && part.images.length > 0
        ? `${baseUrl}${part.images[0]}`
        : 'https://via.placeholder.com/400x300?text=Нет+фото';

    const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Активно': return '#10b981';
            case 'На модерации': return '#f59e0b';
            case 'Продано': return '#64748b';
            default: return '#3b82f6';
        }
    };

    return (
        <Card
            onClick={() => navigate(`/parts/${part.id}`)}
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#1a1d24',
                color: '#ffffff',
                borderRadius: '12px',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '1px solid #2d3139',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }
            }}
        >
            {isMyAd && (
                <Chip
                    label={part.statusName}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        bgcolor: getStatusColor(part.statusName),
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem'
                    }}
                    size="small"
                />
            )}

            <Box sx={{ position: 'relative', pt: '60%', width: '100%' }}>
                <CardMedia
                    component="img"
                    image={mainImage}
                    alt={part.title}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </Box>

            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            fontSize: '1.05rem',
                            lineHeight: 1.2,
                            color: '#f8fafc',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '2.4em'
                        }}
                    >
                        {part.title}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: '#94a3b8',
                            mb: 2,
                            fontSize: '0.85rem',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '1.4em' 
                        }}
                    >
                        {part.categoryName} • {part.brandName}
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 1.5,
                    borderTop: '1px solid #2d3139'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                        {formatNumber(part.priceByn)} BYN
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        {part.conditionName || 'Б/у'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SparePartCard;