// src/components/Footer.jsx
import { Box, Typography, Divider, Link, Container } from '@mui/material';
import { useEffect, useState } from 'react';

const Footer = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const utcTime = time.toUTCString().slice(17, 25);
    const minskTime = time.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Minsk' });

    return (
        <Box component="footer" sx={{ mt: 'auto', py: 4, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
                    <Link href="#" color="text.secondary" underline="hover" variant="body2">Политика конфиденциальности</Link>
                    <Link href="#" color="text.secondary" underline="hover" variant="body2">Пользовательское соглашение</Link>
                    <Link href="#" color="text.secondary" underline="hover" variant="body2">Помощь и FAQ</Link>
                    <Link href="#" color="text.secondary" underline="hover" variant="body2">Контакты редакции</Link>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} car-market.by — Все права защищены.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            UTC: {utcTime}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            Минск: {minskTime}
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;