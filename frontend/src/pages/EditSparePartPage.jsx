import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNavigate, useParams } from 'react-router-dom';

const CONDITIONS = [
    { id: 0, name: 'Новое' },
    { id: 1, name: 'Б/у' },
    { id: 2, name: 'Восстановлено' },
    { id: 3, name: 'С дефектом' },
    { id: 4, name: 'На разбор / запчасти' }
];

export default function EditSparePartPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [partInfo, setPartInfo] = useState({ brandName: '', categoryName: '' });

    const [formData, setFormData] = useState({
        Title: '',
        SparePartCategoryId: '',
        BrandId: '',
        PriceByn: '',
        Description: '',
        Condition: 0
    });

    const [newImages, setNewImages] = useState([]);
    const [message, setMessage] = useState({ text: '', isError: false });
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const loadPartData = async () => {
            try {
                const response = await api.get(`/SpareParts/${id}`);
                const part = response.data;

                const fetchedCategoryId = part.sparePartCategoryId ??
                    part.categoryId ??
                    part.category?.id ??
                    part.SparePartCategoryId ?? '';

                const fetchedBrandId = part.brandId ??
                    part.carBrandId ??
                    part.brand?.id ??
                    part.BrandId ?? '';

                setFormData({
                    Title: part.title ?? part.Title ?? '',
                    SparePartCategoryId: fetchedCategoryId,
                    BrandId: fetchedBrandId,
                    PriceByn: part.priceByn ?? part.PriceByn ?? '',
                    Description: part.description ?? part.Description ?? '',
                    Condition: part.conditionId ?? part.condition ?? part.Condition ?? 0
                });

                setPartInfo({
                    brandName: part.brandName ?? part.brand?.name ?? 'Универсальная',
                    categoryName: part.categoryName ?? part.category?.name ?? 'Без категории'
                });

            } catch (error) {
                console.error("Не удалось загрузить данные запчасти:", error);
                setMessage({ text: 'Ошибка при загрузке данных объявления.', isError: true });
            } finally {
                setPageLoading(false);
            }
        };

        loadPartData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImages(prev => [...prev, file]);
        }
        e.target.value = null;
    };

    const handleRemoveNewImage = (indexToRemove) => {
        setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', isError: false });

        if (!formData.Title.trim()) {
            setMessage({ text: 'Пожалуйста, укажите название запчасти.', isError: true });
            setLoading(false);
            return;
        }
        if (Number(formData.PriceByn) <= 0) {
            setMessage({ text: 'Цена должна быть больше нуля.', isError: true });
            setLoading(false);
            return;
        }

        const dataToSend = new FormData();

        Object.keys(formData).forEach(key => {
            if ((key === 'BrandId' || key === 'SparePartCategoryId') && formData[key] === '') {
                console.warn(`[UPDATE WARNING] Поле ${key} пустое перед отправкой PUT-запроса!`);
            }
            dataToSend.append(key, formData[key]);
        });

        newImages.forEach(file => {
            dataToSend.append('ImageFiles', file);
        });

        try {
            await api.put(`/SpareParts/${id}`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ text: 'Объявление успешно обновлено! Перенаправление...', isError: false });
            setTimeout(() => navigate(`/parts/${id}`), 2000);
        } catch (error) {
            console.error("Ошибка при PUT-запросе:", error);
            const errorText = error.response?.data?.message || 'Ошибка при обновлении объявления.';
            setMessage({ text: errorText, isError: true });
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div style={{ textAlign: 'center', marginTop: '40px', fontFamily: 'sans-serif' }}>Загрузка данных запчасти...</div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1e3a8a', marginBottom: '5px' }}>Редактирование запчасти</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '15px' }}>
                Категория: <strong style={{ color: '#333' }}>{partInfo.categoryName}</strong> | Бренд: <strong style={{ color: '#333' }}>{partInfo.brandName}</strong> <span style={{ fontSize: '12px', color: '#999' }}>(Изменить нельзя)</span>
            </p>

            {message.text && (
                <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.isError ? '#f8d7da' : '#d4edda', color: message.isError ? '#721c24' : '#155724' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* НАЗВАНИЕ ЗАПЧАСТИ */}
                <label>
                    Название запчасти *
                    <input type="text" name="Title" value={formData.Title} onChange={handleInputChange} style={inputStyle} placeholder="Например: Фильтр масляный, Фара левая..." required />
                </label>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* ЦЕНА */}
                    <label style={{ flex: 1 }}>
                        Цена (BYN) *
                        <input type="number" name="PriceByn" min="0.01" step="0.01" value={formData.PriceByn} onChange={handleInputChange} style={inputStyle} required />
                    </label>

                    {/* СОСТОЯНИЕ */}
                    <label style={{ flex: 1 }}>
                        Состояние *
                        <select name="Condition" value={formData.Condition} onChange={handleInputChange} style={inputStyle} required>
                            {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </label>
                </div>

                {/* ОПИСАНИЕ */}
                <label>
                    Описание объявления
                    <textarea name="Description" value={formData.Description} onChange={handleInputChange} rows="5" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Опишите применимость, артикул или состояние детали..."></textarea>
                </label>

                {/* УПРАВЛЕНИЕ ФОТОГРАФИЯМИ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginTop: '5px' }}>
                        Обновить фотографии запчасти
                    </span>

                    <blockquote style={{ margin: 0, padding: '10px', backgroundColor: '#fff7ed', borderLeft: '4px solid #f97316', fontSize: '12.5px', color: '#c2410c', borderRadius: '4px', lineHeight: '1.4' }}>
                        ⚠️ <strong>Важно:</strong> При загрузке новых фотографий все старые изображения этой запчасти будут полностью удалены. Если вы хотите оставить старые фото, просто не выбирайте новые файлы.
                    </blockquote>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                        {newImages.map((file, index) => (
                            <div key={index} style={{ position: 'relative', width: '105px', height: '105px', borderRadius: '8px', overflow: 'hidden', border: index === 0 ? '2px solid #10b981' : '1px solid #ccc' }}>
                                <img src={URL.createObjectURL(file)} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {index === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#10b981', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold' }}>Главная</div>}
                                <button type="button" onClick={() => handleRemoveNewImage(index)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>
                        ))}

                        <label style={{ width: '105px', height: '105px', borderRadius: '8px', border: '2px dashed #b1b1b1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f9f9f9', userSelect: 'none' }}>
                            <span style={{ fontSize: '28px', color: '#666', lineHeight: 1 }}>+</span>
                            <span style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Добавить</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>

                {/* КНОПКА ОТПРАВКИ */}
                <button type="submit" disabled={loading} style={{
                    padding: '12px',
                    backgroundColor: loading ? '#ccc' : '#1e40af',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    marginTop: '10px'
                }}>
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
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