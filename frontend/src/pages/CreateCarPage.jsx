import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

const FUEL_TYPES = [
    { id: 0, name: 'Бензин' }, { id: 1, name: 'Дизель' }, { id: 2, name: 'Электро' }, { id: 3, name: 'Гибрид' }, { id: 4, name: 'Газ' }
];

const TRANSMISSIONS = [
    { id: 0, name: 'Механика' }, { id: 1, name: 'Автомат' }, { id: 2, name: 'Робот' }, { id: 3, name: 'Вариатор' }
];

const BODY_TYPES = [
    { id: 0, name: 'Седан' }, { id: 1, name: 'Внедорожник' }, { id: 2, name: 'Хэтчбек' }, { id: 3, name: 'Купе' },
    { id: 4, name: 'Минивэн' }, { id: 5, name: 'Универсал' }, { id: 6, name: 'Лифтбек' }, { id: 7, name: 'Пикап' }, { id: 8, name: 'Грузовик' }
];

const DRIVE_TYPES = [
    { id: 0, name: 'Передний' }, { id: 1, name: 'Задний' }, { id: 2, name: 'Полный' }
];

const CONDITIONS = [
    { id: 0, name: 'Новая' }, { id: 1, name: 'С пробегом' }, { id: 2, name: 'Аварийная' }, { id: 3, name: 'На запчасти' }
];

export default function CreateCarPage() {
    const navigate = useNavigate();

    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [selectedRegionId, setSelectedRegionId] = useState('');

    const [formData, setFormData] = useState({
        vehicleModelId: '',
        cityId: '',
        year: new Date().getFullYear(),
        priceByn: '',
        mileage: '0',
        description: '',
        enginePower: '',
        engineVolume: '',
        batteryCapacity: '',
        fuel: 0,
        transmission: 0,
        body: 0,
        drive: 0,
        condition: 1
    });

    const [images, setImages] = useState([]);
    const [message, setMessage] = useState({ text: '', isError: false });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadInitialDirectories = async () => {
            try {
                const [brandsRes, regionsRes] = await Promise.all([
                    api.get('/Directory/brands'),
                    api.get('/Directory/regions')
                ]);
                setBrands(brandsRes.data);
                setRegions(regionsRes.data);
            } catch (error) {
                console.error("Ошибка при загрузке справочников:", error);
                setMessage({ text: 'Не удалось загрузить списки городов и марок. Проверьте бэкенд.', isError: true });
            }
        };
        loadInitialDirectories();
    }, []);

    const handleBrandChange = async (e) => {
        const brandId = e.target.value;
        setSelectedBrandId(brandId);

        setModels([]);
        setFormData(prev => ({ ...prev, vehicleModelId: '' }));

        if (brandId) {
            try {
                const res = await api.get(`/Directory/models?brandId=${brandId}`);
                setModels(res.data);
            } catch (error) {
                console.error("Ошибка загрузки моделей:", error);
            }
        }
    };

    const handleRegionChange = async (e) => {
        const regionId = e.target.value;
        setSelectedRegionId(regionId);

        setCities([]);
        setFormData(prev => ({ ...prev, cityId: '' }));

        if (regionId) {
            try {
                const res = await api.get(`/Directory/cities?regionId=${regionId}`);
                setCities(res.data);
            } catch (error) {
                console.error("Ошибка загрузки городов:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImages(prev => [...prev, file]);
        }
        e.target.value = null;
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', isError: false });

        // --- Валидация ---
        if (!formData.vehicleModelId || !formData.cityId) {
            setMessage({ text: 'Пожалуйста, выберите марку, модель и город.', isError: true });
            setLoading(false);
            return;
        }

        if (Number(formData.priceByn) <= 0) {
            setMessage({ text: 'Цена должна быть больше нуля.', isError: true });
            setLoading(false);
            return;
        }

        if (Number(formData.mileage) < 0) {
            setMessage({ text: 'Пробег не может быть отрицательным.', isError: true });
            setLoading(false);
            return;
        }

        if (Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear() + 1) {
            setMessage({ text: 'Указан некорректный год выпуска машины.', isError: true });
            setLoading(false);
            return;
        }

        if (Number(formData.enginePower) <= 0) {
            setMessage({ text: 'Мощность двигателя должна быть больше нуля.', isError: true });
            setLoading(false);
            return;
        }

        if (Number(formData.fuel) !== 2 && Number(formData.engineVolume) <= 0) {
            setMessage({ text: 'Для машин с ДВС объем двигателя должен быть больше нуля.', isError: true });
            setLoading(false);
            return;
        }

        if ((Number(formData.fuel) === 2 || Number(formData.fuel) === 3) && Number(formData.batteryCapacity) <= 0) {
            setMessage({ text: 'Для электромобилей/гибридов емкость батареи должна быть больше нуля.', isError: true });
            setLoading(false);
            return;
        }

        // --- КОНЕЦ ВАЛИДАЦИИ ---

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'engineVolume' && Number(formData.fuel) === 2) return;
            if (key === 'batteryCapacity' && Number(formData.fuel) !== 2 && Number(formData.fuel) !== 3) return;
            dataToSend.append(key, formData[key]);
        });

        images.forEach(file => {
            dataToSend.append('ImageFiles', file);
        });

        try {
            const response = await api.post('/CarAds', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ text: `Успех! Объявление создано с ID: ${response.data.id}`, isError: false });
            setImages([]);
            setTimeout(() => navigate('/'), 2000); 
        } catch (error) {
            const errorText = error.response?.data?.message || 'Что-то пошло не так при сохранении.';
            setMessage({ text: errorText, isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1e3a8a', marginBottom: '20px' }}>Подать объявление о продаже авто</h2>

            {message.text && (
                <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.isError ? '#f8d7da' : '#d4edda', color: message.isError ? '#721c24' : '#155724' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* ВЫБОР АВТОМОБИЛЯ (Зависимые списки) */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1 }}>
                        Марка *
                        <select value={selectedBrandId} onChange={handleBrandChange} style={inputStyle} required>
                            <option value="">-- Выберите марку --</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </label>
                    <label style={{ flex: 1 }}>
                        Модель *
                        <select name="vehicleModelId" value={formData.vehicleModelId} onChange={handleInputChange} style={inputStyle} disabled={!selectedBrandId} required>
                            <option value="">-- Выберите модель --</option>
                            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </label>
                </div>

                {/* ВЫБОР ГЕОГРАФИИ (Зависимые списки) */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1 }}>
                        Область *
                        <select value={selectedRegionId} onChange={handleRegionChange} style={inputStyle} required>
                            <option value="">-- Выберите область --</option>
                            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </label>
                    <label style={{ flex: 1 }}>
                        Город *
                        <select name="cityId" value={formData.cityId} onChange={handleInputChange} style={inputStyle} disabled={!selectedRegionId} required>
                            <option value="">-- Выберите город --</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                </div>

                {/* ОСНОВНЫЕ ХАРАКТЕРИСТИКИ С ОГРАНИЧЕНИЕМ МИНИМУМА (min="0") */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1 }}>
                        Год выпуска *
                        <input type="number" name="year" min="1900" max={new Date().getFullYear() + 1} value={formData.year} onChange={handleInputChange} style={inputStyle} required />
                    </label>
                    <label style={{ flex: 1 }}>
                        Цена (BYN) *
                        <input type="number" name="priceByn" min="1" value={formData.priceByn} onChange={handleInputChange} style={inputStyle} required />
                    </label>
                    <label style={{ flex: 1 }}>
                        Пробег (км) *
                        <input type="number" name="mileage" min="0" value={formData.mileage} onChange={handleInputChange} style={inputStyle} required />
                    </label>
                </div>

                {/* ХАРАКТЕРИСТИКИ КУЗОВА */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <label style={{ minWidth: '140px', flex: 1 }}>
                        Тип топлива
                        <select name="fuel" value={formData.fuel} onChange={handleInputChange} style={inputStyle}>
                            {FUEL_TYPES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </label>
                    <label style={{ minWidth: '140px', flex: 1 }}>
                        Коробка передач
                        <select name="transmission" value={formData.transmission} onChange={handleInputChange} style={inputStyle}>
                            {TRANSMISSIONS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </label>
                    <label style={{ minWidth: '140px', flex: 1 }}>
                        Тип кузова
                        <select name="body" value={formData.body} onChange={handleInputChange} style={inputStyle}>
                            {BODY_TYPES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1 }}>
                        Привод
                        <select name="drive" value={formData.drive} onChange={handleInputChange} style={inputStyle}>
                            {DRIVE_TYPES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </label>
                    <label style={{ flex: 1 }}>
                        Состояние
                        <select name="condition" value={formData.condition} onChange={handleInputChange} style={inputStyle}>
                            {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f0f2f5', padding: '10px', borderRadius: '6px' }}>
                    <label style={{ flex: 1 }}>
                        Мощность (л.с.) *
                        <input type="number" name="enginePower" min="1" value={formData.enginePower} onChange={handleInputChange} style={inputStyle} required />
                    </label>

                    {Number(formData.fuel) !== 2 && (
                        <label style={{ flex: 1 }}>
                            Объем двигателя (л) *
                            <input type="number" step="0.1" name="engineVolume" min="0.1" value={formData.engineVolume} onChange={handleInputChange} style={inputStyle} required />
                        </label>
                    )}

                    {(Number(formData.fuel) === 2 || Number(formData.fuel) === 3) && (
                        <label style={{ flex: 1 }}>
                            Ёмкость батареи (кВт*ч) *
                            <input type="number" name="batteryCapacity" min="1" value={formData.batteryCapacity} onChange={handleInputChange} style={inputStyle} required />
                        </label>
                    )}
                </div>

                <label>
                    Описание объявления
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Опишите состояние машины..."></textarea>
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                        Фотографии автомобиля (первая фотка будет главной)
                    </span>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '5px' }}>

                        {images.map((file, index) => (
                            <div
                                key={index}
                                style={{
                                    position: 'relative',
                                    width: '105px',
                                    height: '105px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: index === 0 ? '2px solid #10b981' : '1px solid #ccc',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                                }}
                            >
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`preview-${index}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />

                                {index === 0 && (
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        backgroundColor: '#10b981', color: '#fff',
                                        fontSize: '11px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold'
                                    }}>
                                        Главная
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    style={{
                                        position: 'absolute', top: '4px', right: '4px',
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        border: 'none', backgroundColor: 'rgba(0,0,0,0.6)',
                                        color: '#fff', fontSize: '12px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        <label
                            style={{
                                width: '105px',
                                height: '105px',
                                borderRadius: '8px',
                                border: '2px dashed #b1b1b1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#f9f9f9',
                                userSelect: 'none'
                            }}
                        >
                            <span style={{ fontSize: '28px', color: '#666', lineHeight: 1 }}>+</span>
                            <span style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Добавить</span>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>

                <button type="submit" disabled={loading} style={{
                    padding: '12px',
                    backgroundColor: loading ? '#ccc' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    marginTop: '10px'
                }}>
                    {loading ? 'Публикация...' : 'Создать объявление'}
                </button>
            </form>
        </div>
    );
}

const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
};