// src/components/MySpareParts.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Typography, CircularProgress, Box } from '@mui/material';
import SparePartCard from './SparePartCard';

const MySpareParts = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyParts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/SpareParts/my');
                setParts(response.data);
            } catch (err) {
                console.error("Ошибка при загрузке запчастей:", err);
                setError("Не удалось загрузить ваши объявления по запчастям.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyParts();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="success" />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography variant="body1" sx={{ color: '#ef4444', textAlign: 'center', py: 4 }}>
                {error}
            </Typography>
        );
    }

    if (parts.length === 0) {
        return (
            <Typography variant="body1" sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
                У вас пока нет объявлений по продаже запчастей.
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)'
                    },
                    gap: 3,
                    mb: 5
                }}
            >
                {parts.map((part) => (
                    <SparePartCard key={part.id} part={part} isMyAd={true} />
                ))}
            </Box>
        </Box>
    );
};

export default MySpareParts;