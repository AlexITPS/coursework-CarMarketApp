import { Dialog, DialogTitle, DialogContent, Box, TextField, Button, Typography, IconButton } from '@mui/material';
import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';

const AuthModal = ({ open, onClose, onAuthSuccess }) => {
    const [isRegister, setIsRegister] = useState(false); // false = Вход, true = Регистрация

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '+375'
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) newErrors.email = 'Email обязателен';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Некорректный формат email';

        if (!formData.password) newErrors.password = 'Пароль обязателен';
        else if (formData.password.length < 6) newErrors.password = 'Пароль должен быть от 6 символов';

        if (isRegister) {
            if (!formData.firstName.trim()) newErrors.firstName = 'Введите имя';
            if (!formData.lastName.trim()) newErrors.lastName = 'Введите фамилию';

            const cleanPhone = formData.phone.replace(/[\s()-]/g, '');
            const belarusPhoneRegex = /^\+375(25|29|33|44)\d{7}$/;

            if (!formData.phone || formData.phone === '+375') {
                newErrors.phone = 'Телефон обязателен';
            } else if (!belarusPhoneRegex.test(cleanPhone)) {
                newErrors.phone = 'Формат: +375 (25/29/33/44) XXX-XX-XX';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) return;

        const endpoint = isRegister ? '/Auth/register' : '/Auth/login';

        const payload = isRegister ? {
            ...formData,
            phone: formData.phone.replace(/[\s()-]/g, '')
        } : {
            email: formData.email,
            password: formData.password
        };

        try {
            const res = await api.post(endpoint, payload);

            if (isRegister) {
                setIsRegister(false);
                setApiError('Регистрация успешна! Теперь вы можете войти.');
            } else {
                localStorage.setItem('token', res.data.token);
                if (onAuthSuccess) onAuthSuccess(res.data.token);
                handleClose();
            }
        } catch (err) {
            console.error(err);
            setApiError(err.response?.data || 'Произошла ошибка. Попробуйте позже.');
        }
    };

    const handleClose = () => {
        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '+375' });
        setErrors({});
        setApiError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth sx={{ '& .MuiPaper-root': { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                {isRegister ? 'Регистрация' : 'Вход в аккаунт'}
                <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 16, top: 16, color: '#94a3b8' }}>
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {apiError && (
                    <Typography variant="body2" sx={{ color: apiError.includes('успешна') ? 'green' : 'error.main', mb: 2, textAlign: 'center', fontWeight: 500 }}>
                        {apiError}
                    </Typography>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {isRegister && (
                        <>
                            <TextField
                                label="Имя"
                                name="firstName"
                                size="small"
                                fullWidth
                                value={formData.firstName}
                                onChange={handleInputChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                            />
                            <TextField
                                label="Фамилия"
                                name="lastName"
                                size="small"
                                fullWidth
                                value={formData.lastName}
                                onChange={handleInputChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                            />
                            <TextField
                                label="Номер телефона"
                                name="phone"
                                size="small"
                                fullWidth
                                placeholder="+375 (XX) XXX-XX-XX"
                                value={formData.phone}
                                onChange={handleInputChange}
                                error={!!errors.phone}
                                helperText={errors.phone}
                            />
                        </>
                    )}

                    <TextField
                        label="Электронная почта"
                        name="email"
                        type="email"
                        size="small"
                        fullWidth
                        value={formData.email}
                        onChange={handleInputChange}
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        label="Пароль"
                        name="password"
                        type="password"
                        size="small"
                        fullWidth
                        value={formData.password}
                        onChange={handleInputChange}
                        error={!!errors.password}
                        helperText={errors.password}
                    />

                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 1, py: 1, fontWeight: 600, bgcolor: '#0052cc', borderRadius: 2 }}>
                        {isRegister ? 'Создать аккаунт' : 'Войти'}
                    </Button>

                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {isRegister ? 'Уже есть аккаунт?' : 'Впервые на сайте?'}
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => { setIsRegister(!isRegister); setErrors({}); setApiError(''); }}
                                sx={{ color: '#0052cc', fontWeight: 600, ml: 0.5, textTransform: 'none' }}
                            >
                                {isRegister ? 'Войти' : 'Зарегистрироваться'}
                            </Button>
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;