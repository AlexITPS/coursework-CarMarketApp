import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Landmark, User, FileText, PlusCircle } from 'lucide-react';
import AuthModal from './AuthModal';

const Header = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [adMenuAnchor, setAdMenuAnchor] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setAnchorEl(null);
        navigate('/');
    };

    const handleAuthSuccess = (newToken) => {
        setToken(newToken);
        setAuthModalOpen(false);
    };

    const handleAdButtonClick = (e) => {
        if (!token) {
            setAuthModalOpen(true);
        } else {
            setAdMenuAnchor(e.currentTarget);
        }
    };

    return (
        <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: '#ffffff' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 70 }}>

                    <Typography
                        variant="h5"
                        component={Link}
                        to="/"
                        sx={{ fontWeight: 800, color: '#1e3a8a', textDecoration: 'none' }}
                    >
                        car-market<span style={{ color: '#10b981' }}>.by</span>
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button component={Link} to="/news" startIcon={<FileText size={18} />} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Новости
                        </Button>
                        <Button component={Link} to="/converter" startIcon={<Landmark size={18} />} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Конвертер валют
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            component={Link}
                            to="/favorites"
                            startIcon={<Heart size={18} color="#ef4444" />}
                            color="inherit"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Избранное
                        </Button>

                        {token ? (
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="primary" sx={{ p: 0.5 }}>
                                <Avatar sx={{ bgcolor: '#1e3a8a', width: 36, height: 36 }}>
                                    <User size={20} />
                                </Avatar>
                            </IconButton>
                        ) : (
                            <Button
                                onClick={() => setAuthModalOpen(true)}
                                color="inherit"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Войти
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            onClick={handleAdButtonClick}
                            startIcon={<PlusCircle size={18} />}
                            sx={{
                                bgcolor: '#2563eb',
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#1d4ed8' }
                            }}
                        >
                            Подать объявление
                        </Button>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        disableScrollLock 
                    >
                        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile?tab=my-ads'); }}>Мои объявления</MenuItem>
                        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile?tab=favorites'); }}>Закладки</MenuItem>
                        <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                    </Menu>

                    <Menu
                        anchorEl={adMenuAnchor}
                        open={Boolean(adMenuAnchor)}
                        onClose={() => setAdMenuAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        disableScrollLock
                    >
                        <MenuItem onClick={() => { setAdMenuAnchor(null); navigate('/create-ad/car'); }}>
                            🚗 Продать автомобиль
                        </MenuItem>
                        <MenuItem onClick={() => { setAdMenuAnchor(null); navigate('/create-ad/spare-part'); }}>
                            ⚙️ Продать запчасти
                        </MenuItem>
                    </Menu>

                </Toolbar>
            </Container>

            {AuthModal && (
                <AuthModal
                    open={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}
        </AppBar>
    );
};

export default Header;