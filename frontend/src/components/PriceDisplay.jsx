import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { api } from '../api/client';

const PriceDisplay = ({ priceByn, variantByn = "h4", variantUsd = "subtitle1" }) => {
    const [usdRate, setUsdRate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/currency/rates')
            .then(res => {
                const usd = res.data.find(r => r.code === 'USD');
                if (usd) {
                    setUsdRate(usd);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Не удалось подгрузить курс USD для отображения цены:", err);
                setLoading(false);
            });
    }, []);

    const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(Math.round(num));

    const priceInUsd = usdRate ? priceByn * (usdRate.scale / usdRate.rate) : null;

    if (loading) return <CircularProgress size={20} sx={{ color: '#10b981' }} />;

    return (
        <Box>
            <Typography variant={variantByn} sx={{ fontWeight: 800, color: '#10b981' }}>
                {formatNumber(priceByn)} BYN
            </Typography>

            {priceInUsd && (
                <Typography variant={variantUsd} sx={{ color: '#94a3b8', fontWeight: 600, mt: 0.5 }}>
                    ≈ ${formatNumber(priceInUsd)}
                </Typography>
            )}
        </Box>
    );
};

export default PriceDisplay;