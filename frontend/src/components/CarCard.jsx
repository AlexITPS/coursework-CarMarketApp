// src/components/CarCard.jsx
import { Card, CardMedia, CardContent, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CarCard = ({ car, isMyAd = false }) => {
    const navigate = useNavigate();
    const baseUrl = 'https://localhost:7225';

    const mainImage = car.images && car.images.length > 0
        ? `${baseUrl}${car.images[0]}`
        : 'https://via.placeholder.com/400x300?text=Нет+фото';

    const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
            case 'Активно': return '#10b981';
            case 'OnModeration':
            case 'На модерации': return '#f59e0b';
            case 'Sold':
            case 'Продано': return '#64748b';
            default: return '#3b82f6';
        }
    };

    return (
        <Card
            onClick={() => navigate(`/cars/${car.id}`)}
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
                    label={car.status}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        bgcolor: getStatusColor(car.status),
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
                    alt={`${car.brandName} ${car.modelName}`}
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

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            fontSize: '1.1rem',
                            color: '#f8fafc',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '2.4em'
                        }}
                    >
                        {car.brandName} {car.modelName}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: '#94a3b8',
                            mb: 2,
                            fontSize: '0.85rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '2.8em',
                            lineHeight: 1.4
                        }}
                    >
                        {car.year} г., {car.transmission?.toLowerCase()}, {car.engineVolume?.toFixed(1)} л, {car.fuel?.toLowerCase()}, {formatNumber(car.mileage)} км
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1, borderTop: '1px solid #2d3139' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                        {formatNumber(car.priceByn)} BYN
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {car.cityName}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CarCard;