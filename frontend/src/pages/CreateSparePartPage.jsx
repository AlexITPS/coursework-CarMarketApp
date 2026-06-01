import React, { useState, useEffect } from 'react';
import { api } from '../api/client'; 
import { useNavigate } from 'react-router-dom';

const SPARE_PART_CONDITIONS = [
    { id: 0, name: 'Новое' },
    { id: 1, name: 'Б/У' },
    { id: 2, name: 'Восстановленное' },
    { id: 3, name: 'С дефектами' },
    { id: 4, name: 'На запчасти' }
];

export default function CreateSparePartPage() {
    const navigate = useNavigate();

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        Title: '',
        SparePartCategoryId: '',
        BrandId: '',
        PriceByn: '',
        Description: '',
        Condition: 0
    });

    const [images, setImages] = useState([]);
    const [message, setMessage] = useState({ text: '', isError: false });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadDirectories = async () => {
            try {
                const [brandsRes, categoriesRes] = await Promise.all([
                    api.get('/Directory/brands'),
                    api.get('/Directory/spare-categories')
                ]);
                setBrands(brandsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error("Ошибка загрузки справочников запчастей:", error);
                setMessage({ text: 'Не удалось загрузить категории или бренды.', isError: true });
            }
        };
        loadDirectories();
    }, []);

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
        if (!formData.Title.trim()) {
            setMessage({ text: 'Укажите название запчасти.', isError: true });
            setLoading(false);
            return;
        }

        if (!formData.BrandId) {
            setMessage({ text: 'Пожалуйста, выберите применимость к марке авто.', isError: true });
            setLoading(false);
            return;
        }

        if (!formData.SparePartCategoryId) {
            setMessage({ text: 'Пожалуйста, выберите категорию запчасти.', isError: true });
            setLoading(false);
            return;
        }

        if (Number(formData.PriceByn) <= 0) {
            setMessage({ text: 'Цена должна быть строго больше нуля.', isError: true });
            setLoading(false);
            return;
        }
        // --- КОНЕЦ ВАЛИДАЦИИ ---

        const dataToSend = new FormData();
        dataToSend.append('Title', formData.Title.trim());
        dataToSend.append('SparePartCategoryId', formData.SparePartCategoryId);
        dataToSend.append('BrandId', formData.BrandId);
        dataToSend.append('PriceByn', formData.PriceByn);
        dataToSend.append('Description', formData.Description);
        dataToSend.append('Condition', formData.Condition);

        images.forEach(file => {
            dataToSend.append('ImageFiles', file);
        });

        try {
            const response = await api.post('/SpareParts', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ text: `Успех! ${response.data.message || 'Объявление создано'}`, isError: false });
            setImages([]);

            setTimeout(() => navigate('/spare-parts'), 2000);
        } catch (error) {
            console.error(error);
            const errorText = error.response?.data?.message || 'Ошибка при сохранении объявления запчасти.';
            setMessage({ text: errorText, isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#0f766e', marginBottom: '20px' }}>Продать запчасть</h2>

            {message.text && (
                <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.isError ? '#f8d7da' : '#d4edda', color: message.isError ? '#721c24' : '#155724' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* Название запчасти */}
                <label>
                    Название объявления *
                    <input type="text" name="Title" value={formData.Title} onChange={handleInputChange} style={inputStyle} placeholder="Например: Фара левая на BMW e39" required />
                </label>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Выбор бренда */}
                    <label style={{ flex: 1 }}>
                        Марка автомобиля *
                        <select name="BrandId" value={formData.BrandId} onChange={handleInputChange} style={inputStyle} required>
                            <option value="">-- Выберите марку --</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </label>

                    {/* Выбор категории запчасти */}
                    <label style={{ flex: 1 }}>
                        Категория детали *
                        <select name="SparePartCategoryId" value={formData.SparePartCategoryId} onChange={handleInputChange} style={inputStyle} required>
                            <option value="">-- Выберите категорию --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Цена с блокировкой на уровне HTML min="0.01" */}
                    <label style={{ flex: 1 }}>
                        Цена (BYN) *
                        <input type="number" step="0.01" name="PriceByn" min="0.01" value={formData.PriceByn} onChange={handleInputChange} style={inputStyle} required />
                    </label>

                    {/* Состояние детали */}
                    <label style={{ flex: 1 }}>
                        Состояние *
                        <select name="Condition" value={formData.Condition} onChange={handleInputChange} style={inputStyle}>
                            {SPARE_PART_CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                </div>

                {/* Описание детали */}
                <label>
                    Описание детали
                    <textarea name="Description" value={formData.Description} onChange={handleInputChange} rows="4" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Опишите состояние, артикул, дефекты если они есть..."></textarea>
                </label>

                {/* БЛОК ИЗОБРАЖЕНИЙ С ПЛЮСИКОМ И ПРЕВЬЮ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                        Фотографии детали (первое фото станет обложкой)
                    </span>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '5px' }}>
                        {images.map((file, index) => (
                            <div
                                key={index}
                                style={{
                                    position: 'relative', width: '105px', height: '105px',
                                    borderRadius: '8px', overflow: 'hidden',
                                    border: index === 0 ? '2px solid #0f766e' : '1px solid #ccc',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                                }}
                            >
                                <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {index === 0 && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0f766e', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold' }}>
                                        Главная
                                    </div>
                                )}
                                <button type="button" onClick={() => handleRemoveImage(index)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>
                        ))}

                        {/* Кнопка-Плюс */}
                        <label style={{ width: '105px', height: '105px', borderRadius: '8px', border: '2px dashed #b1b1b1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyProject: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f9f9f9', userSelect: 'none' }}>
                            <span style={{ fontSize: '28px', color: '#666', lineHeight: 1 }}>+</span>
                            <span style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Добавить</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                {/* Кнопка отправки формы */}
                <button type="submit" disabled={loading} style={{
                    padding: '12px',
                    backgroundColor: loading ? '#ccc' : '#0f766e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    marginTop: '10px'
                }}>
                    {loading ? 'Публикация...' : 'Выставить деталь на продажу'}
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