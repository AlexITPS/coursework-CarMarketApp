// src/pages/Cars.jsx
import { Container, Typography, Box, Pagination, CircularProgress, Paper, TextField, MenuItem, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import CarCard from '../components/CarCard';

const FUEL_OPTIONS = [
    { id: 0, name: 'Бензин' }, { id: 1, name: 'Дизель' },
    { id: 2, name: 'Электро' }, { id: 3, name: 'Гибрид' }, { id: 4, name: 'Газ' }
];

const TRANSMISSION_OPTIONS = [
    { id: 0, name: 'Механика' }, { id: 1, name: 'Автомат' },
    { id: 2, name: 'Робот' }, { id: 3, name: 'Вариатор (CVT)' }
];

const CONDITION_OPTIONS = [
    { id: 0, name: 'Новое' }, { id: 1, name: 'С пробегом' },
    { id: 2, name: 'Аварийное' }, { id: 3, name: 'На запчасти' }
];

const BODY_OPTIONS = [
    { id: 0, name: 'Седан' }, { id: 1, name: 'Внедорожник' }, { id: 2, name: 'Хэтчбек' },
    { id: 3, name: 'Купе' }, { id: 4, name: 'Минивэн' }, { id: 5, name: 'Универсал' },
    { id: 6, name: 'Лифтбек' }, { id: 7, name: 'Пикап' }, { id: 8, name: 'Грузовик' }
];

const DRIVE_OPTIONS = [
    { id: 0, name: 'Передний' }, { id: 1, name: 'Задний' }, { id: 2, name: 'Полный' }
];

const Cars = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 12;

    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);

    const [localFilters, setLocalFilters] = useState({
        brandId: searchParams.get('brandId') || searchParams.get('brand') || '',
        vehicleModelId: searchParams.get('vehicleModelId') || '',
        regionId: searchParams.get('regionId') || '',
        cityId: searchParams.get('cityId') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minYear: searchParams.get('minYear') || '',
        maxYear: searchParams.get('maxYear') || '',
        fuel: searchParams.get('fuel') || '',
        transmission: searchParams.get('transmission') || '',
        body: searchParams.get('body') || '',
        drive: searchParams.get('drive') || '',
        condition: searchParams.get('condition') || '',
        sortBy: searchParams.get('sortBy') || ''
    });

    useEffect(() => {
        api.get('/Directory/brands').then(res => setBrands(res.data)).catch(err => console.error(err));
        api.get('/Directory/regions').then(res => setRegions(res.data)).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (localFilters.brandId) {
            api.get(`/Directory/models?brandId=${localFilters.brandId}`).then(res => setModels(res.data)).catch(err => console.error(err));
        } else {
            setModels([]);
        }
    }, [localFilters.brandId]);

    useEffect(() => {
        if (localFilters.regionId) {
            api.get(`/Directory/cities?regionId=${localFilters.regionId}`).then(res => setCities(res.data)).catch(err => console.error(err));
        } else {
            setCities([]);
        }
    }, [localFilters.regionId]);

    useEffect(() => {
        setLocalFilters({
            brandId: searchParams.get('brandId') || searchParams.get('brand') || '',
            vehicleModelId: searchParams.get('vehicleModelId') || '',
            regionId: searchParams.get('regionId') || '',
            cityId: searchParams.get('cityId') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            minYear: searchParams.get('minYear') || '',
            maxYear: searchParams.get('maxYear') || '',
            fuel: searchParams.get('fuel') || '',
            transmission: searchParams.get('transmission') || '',
            body: searchParams.get('body') || '',
            drive: searchParams.get('drive') || '',
            condition: searchParams.get('condition') || '',
            sortBy: searchParams.get('sortBy') || ''
        });
    }, [searchParams]);

    const fetchFilteredCars = (currentPage) => {
        setLoading(true);

        const queryParams = {
            PageNumber: currentPage,
            PageSize: pageSize,
            BrandId: searchParams.get('brandId') || searchParams.get('brand') || undefined,
            VehicleModelId: searchParams.get('vehicleModelId') || undefined,
            RegionId: searchParams.get('regionId') || undefined,
            CityId: searchParams.get('cityId') || undefined,
            MinPrice: searchParams.get('minPrice') || undefined,
            MaxPrice: searchParams.get('maxPrice') || undefined,
            MinYear: searchParams.get('minYear') || undefined,
            MaxYear: searchParams.get('maxYear') || undefined,
            Fuel: searchParams.get('fuel') ? parseInt(searchParams.get('fuel')) : undefined,
            Transmission: searchParams.get('transmission') ? parseInt(searchParams.get('transmission')) : undefined,
            Body: searchParams.get('body') ? parseInt(searchParams.get('body')) : undefined,
            Drive: searchParams.get('drive') ? parseInt(searchParams.get('drive')) : undefined,
            Condition: searchParams.get('condition') ? parseInt(searchParams.get('condition')) : undefined,
            SortBy: searchParams.get('sortBy') || undefined
        };

        api.get('/CarAds', { params: queryParams })
            .then(res => {
                setCars(res.data.items || []);
                setTotalPages(res.data.totalPages || 1);
            })
            .catch(err => console.error("Ошибка загрузки каталога:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        setPage(1);
        fetchFilteredCars(1);
    }, [searchParams]);

    useEffect(() => {
        fetchFilteredCars(page);
    }, [page]);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLocalFilterChange = (key, value) => {
        setLocalFilters(prev => {
            const updated = { ...prev, [key]: value };
            if (key === 'brandId') updated.vehicleModelId = '';
            if (key === 'regionId') updated.cityId = '';
            return updated;
        });
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
            brandId: '', vehicleModelId: '', regionId: '', cityId: '',
            minPrice: '', maxPrice: '', minYear: '', maxYear: '',
            fuel: '', transmission: '', body: '', drive: '', condition: '', sortBy: ''
        });
        setSearchParams(new URLSearchParams());
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#0f172a' }}>
                {(searchParams.get('brandId') || searchParams.get('brand')) ? "Объявления выбранной марки" : "Все автомобили в каталоге"}
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
                    {/* УРОВЕНЬ 1: Основное */}
                    <TextField select fullWidth size="small" label="Марка" value={localFilters.brandId} onChange={(e) => handleLocalFilterChange('brandId', e.target.value)}>
                        <MenuItem value="">Все марки</MenuItem>
                        {brands.map(b => <MenuItem key={b.id} value={b.id.toString()}>{b.name}</MenuItem>)}
                    </TextField>

                    <TextField select fullWidth size="small" label="Модель" disabled={!localFilters.brandId} value={localFilters.vehicleModelId} onChange={(e) => handleLocalFilterChange('vehicleModelId', e.target.value)}>
                        <MenuItem value="">Все модели</MenuItem>
                        {models.map(m => <MenuItem key={m.id} value={m.id.toString()}>{m.name}</MenuItem>)}
                    </TextField>

                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        <TextField fullWidth size="small" label="Год от" type="number" value={localFilters.minYear} onChange={(e) => handleLocalFilterChange('minYear', e.target.value)} />
                        <TextField fullWidth size="small" label="до" type="number" value={localFilters.maxYear} onChange={(e) => handleLocalFilterChange('maxYear', e.target.value)} />
                    </Box>

                    {/* УРОВЕНЬ 2: Локация и Сортировка */}
                    <TextField select fullWidth size="small" label="Область" value={localFilters.regionId} onChange={(e) => handleLocalFilterChange('regionId', e.target.value)}>
                        <MenuItem value="">Вся Беларусь</MenuItem>
                        {regions.map(r => <MenuItem key={r.id} value={r.id.toString()}>{r.name}</MenuItem>)}
                    </TextField>

                    <TextField select fullWidth size="small" label="Город" disabled={!localFilters.regionId} value={localFilters.cityId} onChange={(e) => handleLocalFilterChange('cityId', e.target.value)}>
                        <MenuItem value="">Все города</MenuItem>
                        {cities.map(c => <MenuItem key={c.id} value={c.id.toString()}>{c.name}</MenuItem>)}
                    </TextField>

                    <TextField select fullWidth size="small" label="Сортировка" value={localFilters.sortBy} onChange={(e) => handleLocalFilterChange('sortBy', e.target.value)}>
                        <MenuItem value="">По умолчанию</MenuItem>
                        <MenuItem value="price_asc">Сначала дешевые</MenuItem>
                        <MenuItem value="price_desc">Сначала дорогие</MenuItem>
                        <MenuItem value="year_desc">Сначала новые г.в.</MenuItem>
                    </TextField>

                    {/* УРОВЕНЬ 3: Агрегаты */}
                    <TextField select fullWidth size="small" label="Двигатель" value={localFilters.fuel} onChange={(e) => handleLocalFilterChange('fuel', e.target.value)}>
                        <MenuItem value="">Любой</MenuItem>
                        {FUEL_OPTIONS.map(o => <MenuItem key={o.id} value={o.id.toString()}>{o.name}</MenuItem>)}
                    </TextField>

                    <TextField select fullWidth size="small" label="Коробка передач" value={localFilters.transmission} onChange={(e) => handleLocalFilterChange('transmission', e.target.value)}>
                        <MenuItem value="">Любая</MenuItem>
                        {TRANSMISSION_OPTIONS.map(o => <MenuItem key={o.id} value={o.id.toString()}>{o.name}</MenuItem>)}
                    </TextField>

                    <TextField select fullWidth size="small" label="Тип кузова" value={localFilters.body} onChange={(e) => handleLocalFilterChange('body', e.target.value)}>
                        <MenuItem value="">Любой</MenuItem>
                        {BODY_OPTIONS.map(o => <MenuItem key={o.id} value={o.id.toString()}>{o.name}</MenuItem>)}
                    </TextField>

                    {/* УРОВЕНЬ 4: База */}
                    <TextField select fullWidth size="small" label="Привод" value={localFilters.drive} onChange={(e) => handleLocalFilterChange('drive', e.target.value)}>
                        <MenuItem value="">Любой</MenuItem>
                        {DRIVE_OPTIONS.map(o => <MenuItem key={o.id} value={o.id.toString()}>{o.name}</MenuItem>)}
                    </TextField>

                    <TextField select fullWidth size="small" label="Состояние" value={localFilters.condition} onChange={(e) => handleLocalFilterChange('condition', e.target.value)}>
                        <MenuItem value="">Любое</MenuItem>
                        {CONDITION_OPTIONS.map(o => <MenuItem key={o.id} value={o.id.toString()}>{o.name}</MenuItem>)}
                    </TextField>

                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        <TextField fullWidth size="small" label="Цена от, BYN" type="number" value={localFilters.minPrice} onChange={(e) => handleLocalFilterChange('minPrice', e.target.value)} />
                        <TextField fullWidth size="small" label="до" type="number" value={localFilters.maxPrice} onChange={(e) => handleLocalFilterChange('maxPrice', e.target.value)} />
                    </Box>
                </Box>

                {/* НИЖНИЙ РЯД: Кнопка отправки */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button variant="contained" size="large" onClick={handleApplyFilters} sx={{ textTransform: 'none', px: 6, fontWeight: 600, borderRadius: '8px', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                        Найти объявления
                    </Button>
                </Box>
            </Paper>

            {/* ВЫВОД КАТАЛОГА СНИЗУ */}
            <Box sx={{ width: '100%' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : cars.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" sx={{ p: 4, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                        К сожалению, по вашему запросу объявлений не найдено.
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
                            {cars.map((car) => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </Box>

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

export default Cars;