import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, CircularProgress } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { api } from '../api/client';

const ConverterPage = () => {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [amount, setAmount] = useState('100');
    const [fromCurrency, setFromCurrency] = useState('BYN');
    const [toCurrency, setToCurrency] = useState('USD');
    const [result, setResult] = useState(0);

    useEffect(() => {
        api.get('/currency/rates')
            .then(res => {
                const bynCurrency = { code: 'BYN', rate: 1, scale: 1 };
                setRates([bynCurrency, ...res.data]);
                setLoading(false);
            })
            .catch(err => {
                console.error("Ошибка при получении курсов:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (rates.length === 0 || !amount || isNaN(amount)) {
            setResult(0);
            return;
        }

        const fromData = rates.find(r => r.code === fromCurrency);
        const toData = rates.find(r => r.code === toCurrency);

        if (!fromData || !toData) return;

        const amountInByn = parseFloat(amount) * (fromData.rate / fromData.scale);
        const finalResult = amountInByn * (toData.scale / toData.rate);

        setResult(finalResult);
    }, [amount, fromCurrency, toCurrency, rates]);

    const handleFromCurrencyChange = (e) => {
        const nextFrom = e.target.value;
        if (nextFrom === toCurrency) {
            setToCurrency(fromCurrency);
        }
        setFromCurrency(nextFrom);
    };

    const handleToCurrencyChange = (e) => {
        const nextTo = e.target.value;
        if (nextTo === fromCurrency) {
            setFromCurrency(toCurrency);
        }
        setToCurrency(nextTo);
    };

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#10b981' }} />
        </Box>
    );

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    color: '#1e293b',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <CurrencyExchangeIcon sx={{ color: '#1e3a8a', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e3a8a' }}>
                        Конвертер валют
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Сумма"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth
                        InputProps={{ inputProps: { min: 0 } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '& fieldset': { borderColor: '#cbd5e1' },
                                '&:hover fieldset': { borderColor: '#94a3b8' },
                                '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                            }
                        }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl fullWidth sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '& fieldset': { borderColor: '#cbd5e1' },
                                '&:hover fieldset': { borderColor: '#94a3b8' },
                                '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                            }
                        }}>
                            <InputLabel>Из</InputLabel>
                            <Select
                                value={fromCurrency}
                                label="Из"
                                onChange={handleFromCurrencyChange} 
                                MenuProps={{ PaperProps: { sx: { bgcolor: '#ffffff', color: '#1e293b' } } }}
                            >
                                {rates.map(r => <MenuItem key={r.code} value={r.code}>{r.code}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <IconButton
                            onClick={handleSwap}
                            sx={{
                                color: '#475569',
                                bgcolor: '#f1f5f9',
                                '&:hover': { bgcolor: '#e2e8f0' },
                                p: 1.5,
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <SwapHorizIcon />
                        </IconButton>

                        <FormControl fullWidth sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '& fieldset': { borderColor: '#cbd5e1' },
                                '&:hover fieldset': { borderColor: '#94a3b8' },
                                '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                            }
                        }}>
                            <InputLabel>В</InputLabel>
                            <Select
                                value={toCurrency}
                                label="В"
                                onChange={handleToCurrencyChange} 
                                MenuProps={{ PaperProps: { sx: { bgcolor: '#ffffff', color: '#1e293b' } } }}
                            >
                                {rates.map(r => <MenuItem key={r.code} value={r.code}>{r.code}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box
                        sx={{
                            mt: 1,
                            p: 2.5,
                            bgcolor: '#f0fdf4',
                            borderRadius: '12px',
                            border: '1px solid #bbf7d0',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600, mb: 0.5 }}>
                            Результат перевода:
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>
                            {result.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ConverterPage;