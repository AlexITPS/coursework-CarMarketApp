// src/pages/PartsPage.jsx
import { Container, Typography, Box, Pagination, CircularProgress, Paper, TextField, MenuItem, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import SparePartCard from '../components/SparePartCard';

const CONDITION_OPTIONS = [
    { id: 0, name: 'Новое' },
    { id: 1, name: 'Б/У' },
    { id: 2, name: 'Восстановленное' },
    { id: 3, name: 'С дефектом' },
    { id: 4, name: 'На разбор / запчасти' }
];

const PartsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 12;

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const [localFilters, setLocalFilters] = useState({
        brandId: searchParams.get('brandId') || '',
        categoryId: searchParams.get('categoryId') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        condition: searchParams.get('condition') || '',
        sortBy: searchParams.get('sortBy') || ''
    });

    useEffect(() => {
        api.get('/Directory/brands').then(res => setBrands(res.data)).catch(err => console.error(err));
        api.get('/Directory/spare-categories').then(res => setCategories(res.data)).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        setLocalFilters({
            brandId: searchParams.get('brandId') || '',
            categoryId: searchParams.get('categoryId') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            condition: searchParams.get('condition') || '',
            sortBy: searchParams.get('sortBy') || ''
        });
    }, [searchParams]);

    const fetchFilteredParts = (currentPage) => {
        setLoading(true);

        const queryParams = {
            PageNumber: currentPage,
            PageSize: pageSize,
            BrandId: searchParams.get('brandId') || undefined,
            CategoryId: searchParams.get('categoryId') || undefined,
            MinPrice: searchParams.get('minPrice') || undefined,
            MaxPrice: searchParams.get('maxPrice') || undefined,
            Condition: searchParams.get('condition') ? parseInt(searchParams.get('condition')) : undefined,
            SortBy: searchParams.get('sortBy') || undefined
        };

        api.get('/SpareParts', { params: queryParams })
            .then(res => {
                setParts(res.data.items || []);
                setTotalPages(res.data.totalPages || Math.ceil((res.data.totalCount || 0) / pageSize) || 1);
            })
            .catch(err => console.error("Ошибка загрузки запчастей:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        setPage(1);
        fetchFilteredParts(1);
    }, [searchParams]);

    useEffect(() => {
        fetchFilteredParts(page);
    }, [page]);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLocalFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        const newParams = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams);
    };

    const handleResetFilters = () => {
        setLocalFilters({
            brandId: '', categoryId: '', minPrice: '', maxPrice: '', condition: '', sortBy: ''
        });
        setSearchParams(new URLSearchParams());
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#0f172a' }}>
                {searchParams.get('brandId') ? "Запчасти для выбранной марки" : "Каталог запчастей"}
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', mb: 5, bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#1e293b' }}>
                        Параметры поиска
                    </Typography>
                    <Button size="small" onClick={handleResetFilters} sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600 }}>
                        Сбросить всё
                    </Button>
                </Box>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: '1fr 1fr 1fr'
                    },
                    gap: '20px',
                    alignItems: 'center'
                }}>
                    {/* Выбор Марки */}
                    <TextField select fullWidth size="small" label="Марка авто" value={localFilters.brandId} onChange={(e) => handleLocalFilterChange('brandId', e.target.value)}>
                        <MenuItem value="">Все марки</MenuItem>
                        {brands.map(b => <MenuItem key={b.id} value={b.id.toString()}>{b.name}</MenuItem>)}
                    </TextField>

                    {/* Выбор Категории */}
                    <TextField select fullWidth size="small" label="Категория" value={localFilters.categoryId} onChange={(e) => handleLocalFilterChange('categoryId', e.target.value)}>
                        <MenuItem value="">Все категории</MenuItem>
                        {categories.map(c => <MenuItem key={c.id} value={c.id.toString()}>{c.name}</MenuItem>)}
                    </TextField>

                    {/* Выбор Состояния (из твоего Enum) */}
                    <TextField select fullWidth size="small" label="Состояние" value={localFilters.condition} onChange={(e) => handleLocalFilterChange('condition', e.target.value)}>
                        <MenuItem value="">Любое состояние</MenuItem>
                        {CONDITION_OPTIONS.map(o => <MenuItem key={o.id} value={o.id.toString()}>{o.name}</MenuItem>)}
                    </TextField>

                    {/* Сортировка */}
                    <TextField select fullWidth size="small" label="Сортировка" value={localFilters.sortBy} onChange={(e) => handleLocalFilterChange('sortBy', e.target.value)}>
                        <MenuItem value="">По умолчанию (новые)</MenuItem>
                        <MenuItem value="price_asc">Сначала дешевые</MenuItem>
                        <MenuItem value="price_desc">Сначала дорогие</MenuItem>
                    </TextField>

                    {/* Диапазон цен */}
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        <TextField fullWidth size="small" label="Цена от, BYN" type="number" value={localFilters.minPrice} onChange={(e) => handleLocalFilterChange('minPrice', e.target.value)} />
                        <TextField fullWidth size="small" label="до" type="number" value={localFilters.maxPrice} onChange={(e) => handleLocalFilterChange('maxPrice', e.target.value)} />
                    </Box>
                </Box>

                {/* НИЖНИЙ РЯД: Кнопка отправки формы */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button variant="contained" size="large" onClick={handleApplyFilters} sx={{ textTransform: 'none', px: 6, fontWeight: 600, borderRadius: '8px', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                        Найти объявления
                    </Button>
                </Box>
            </Paper>

            {/* ВЫВОД РЕЗУЛЬТАТОВ */}
            <Box sx={{ width: '100%' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : parts.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" sx={{ p: 4, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                        К сожалению, по вашему запросу запчастей не найдено.
                    </Typography>
                ) : (
                    <>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                                lg: 'repeat(4, 1fr)'
                            },
                            gap: 3,
                            mb: 5
                        }}>
                            {parts.map((part) => (
                                <SparePartCard key={part.id} part={part} />
                            ))}
                        </Box>

                        {/* Пагинация */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    sx={{ '& .MuiPaginationItem-root': { fontWeight: 600 } }}
                                />
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Container>
    );
};

export default PartsPage;