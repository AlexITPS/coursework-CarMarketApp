// src/api/client.js
import axios from 'axios';

const BASE_URL = 'https://localhost:7225/api';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Автоматически добавляем JWT токен к каждому запросу, если он есть в системе
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Сервисы для работы с объявлениями
export const carAdsApi = {
    createAd: async (formData) => {
        // Передаем FormData, Axios сам выставит нужные границы (boundary)
        const response = await api.post('/CarAds', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};