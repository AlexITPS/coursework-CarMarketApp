// src/utils/authHelper.js

/**
 * Декодирует JWT токен без использования сторонних библиотек
 */
export const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

/**
 * Получает данные текущего авторизованного пользователя
 */
export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = parseJwt(token);
    if (!decoded) return null;

    // Проверка на истечение срока действия токена (exp в секундах)
    if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token'); // Чистим протухший токен
        return null;
    }

    // Извлекаем кастомные клеймы ASP.NET Core
    const id = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    return {
        id: parseInt(id),
        email: email,
        role: role,
        // Вырезаем красивое имя из почты в качестве временного фолбека, если бэк не шлет имя в JWT
        name: email ? email.split('@')[0] : 'Пользователь'
    };
};