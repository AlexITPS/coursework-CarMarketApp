// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Grid, CircularProgress, Avatar, Tabs, Tab } from '@mui/material';
import { api } from '../api/client';
import { getCurrentUser } from '../utils/authHelper';
import CarCard from '../components/CarCard';
import SparePartCard from '../components/SparePartCard'; 
import { Car, Settings } from 'lucide-react';

const ProfilePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentTab = searchParams.get('tab') || 'my-ads';

    const [user, setUser] = useState(null);
    const [authChecking, setAuthChecking] = useState(true);

    const [myCars, setMyCars] = useState([]);
    const [carsLoading, setCarsLoading] = useState(false);

    const [myParts, setMyParts] = useState([]);
    const [partsLoading, setPartsLoading] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate('/');
            return;
        }
        setUser(currentUser);
        setAuthChecking(false);
    }, [navigate]);

    useEffect(() => {
        if (authChecking || currentTab !== 'my-ads') return;

        if (myCars.length > 0) return;

        setCarsLoading(true);
        api.get('/CarAds/my')
            .then(res => {
                setMyCars(res.data);
            })
            .catch(err => {
                console.error("Ошибка загрузки личных объявлений авто:", err);
            })
            .finally(() => setCarsLoading(false));
    }, [currentTab, authChecking, myCars.length]);

    useEffect(() => {
        if (authChecking || currentTab !== 'spare-parts') return;

        if (myParts.length > 0) return;

        setPartsLoading(true);
        api.get('/SpareParts/my')
            .then(res => {
                setMyParts(res.data);
            })
            .catch(err => {
                console.error("Ошибка загрузки личных объявлений запчастей:", err);
            })
            .finally(() => setPartsLoading(false));
    }, [currentTab, authChecking, myParts.length]);

    const handleTabChange = (event, newValue) => {
        setSearchParams({ tab: newValue });
    };

    if (authChecking) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={50} color="success" />
            </Box>
        );
    }

    const displayName = myCars[0]?.sellerName || myParts[0]?.sellerName || user?.name;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            {/* Блок приветствия */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar sx={{ width: 70, height: 70, bgcolor: '#2563eb', fontSize: '1.8rem', fontWeight: 700 }}>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                </Avatar>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                        Добрый день, {displayName}!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Электронная почта: {user?.email}
                    </Typography>
                </Box>
            </Box>

            {/* Вкладки личного кабинета */}
            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{ borderBottom: '1px solid #e2e8f0', mb: 4 }}
            >
                <Tab label="Объявления авто" value="my-ads" icon={<Car size={18} />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab label="Запчасти" value="spare-parts" icon={<Settings size={18} />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>

            {/* Контент вкладки: Автомобили */}
            {currentTab === 'my-ads' && (
                <Box>
                    {carsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress color="success" />
                        </Box>
                    ) : myCars.length > 0 ? (
                        <Grid container spacing={3}>
                            {myCars.map(car => (
                                <Grid item xs={12} sm={6} md={4} key={car.id} sx={{ display: 'flex' }}>
                                    <CarCard car={car} isMyAd={true} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            У вас пока нет добавленных автомобилей.
                        </Typography>
                    )}
                </Box>
            )}

            {/* Контент вкладки: Запчасти */}
            {currentTab === 'spare-parts' && (
                <Box>
                    {partsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress color="success" />
                        </Box>
                    ) : myParts.length > 0 ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(3, 1fr)'
                                },
                                gap: 3
                            }}
                        >
                            {myParts.map(part => (
                                <SparePartCard key={part.id} part={part} isMyAd={true} />
                            ))}
                        </Box>
                    ) : (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            У вас пока нет добавленных запчастей.
                        </Typography>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default ProfilePage;