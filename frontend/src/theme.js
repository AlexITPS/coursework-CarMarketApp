// src/theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1e3a8a', // Насыщенный синий
        },
        secondary: {
            main: '#10b981', // Зеленый для цен или акцентов
        },
        background: {
            default: '#f8fafc', // Мягкий белый фон сайта
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
        button: {
            textTransform: 'none', // Отменяем капс на кнопках
        },
    },
});