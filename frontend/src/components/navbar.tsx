import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { logoutSession } from '../lib/auth';
import EchoAideLogo from './EchoAideLogo';

const pages = [
  { label: "Patients", path: "/patients" },
  { label: "Appointments", path: "/appointments" },
  { label: "Notes", path: "/notes" },
];

const settings = ['Profile'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  const navigate = useNavigate();

  const loadUser = React.useCallback(() => {
    try {
      const raw =
        localStorage.getItem('ds_user') ??
        sessionStorage.getItem('ds_user');

      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u?.fullName ?? u?.name ?? u?.email ?? String(u));
        setUserRole(u?.role ?? 'doctor');
      } else {
        setUserName(null);
        setUserRole(null);
      }
    } catch {
      setUserName(null);
      setUserRole(null);
    }
  }, []);

  React.useEffect(() => {
    loadUser();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ds_user' || e.key === 'ds_token' || e.key === 'ds_refresh_token') {
        loadUser();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadUser]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (setting: string) => {
    handleCloseUserMenu();
    if (setting === 'Profile') {
      navigate('/profile');
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logoutSession();
    setUserName(null);
    setUserRole(null);
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      className="!fixed !top-0 !left-0 !right-0 !z-50"
      sx={{ bgcolor: "white", color: "text.primary" }}
    >
      <div className="w-full px-4">
        <Toolbar disableGutters className="flex justify-between items-center">

          {/* Left - Desktop Logo */}
          <Box
            className="hidden md:flex items-center cursor-pointer"
            onClick={handleLogoClick}
            aria-label="EchoAide home"
          >
            <EchoAideLogo height={40} />
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{ color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {(userRole === 'receptionist' ? [{ label: 'Intake', path: '/receptionist/intake' }] : pages).map((page) => (
                <MenuItem
                  key={page.path}
                  onClick={() => {
                    navigate(page.path);
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">
                    {page.label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Box
            sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}
            onClick={handleLogoClick}
            className="cursor-pointer justify-center items-center flex"
            aria-label="EchoAide home"
          >
            <EchoAideLogo height={32} />
          </Box>

          {/* Desktop Menu Centered */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {(userRole === 'receptionist' ? [{ label: 'Intake', path: '/receptionist/intake' }] : pages).map((page) => (
              <Button
                key={page.path}
                onClick={() => navigate(page.path)}
                sx={{ my: 2, color: 'text.primary' }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* Right Side - Auth Section */}
          <Box>
            {!userName ? (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                sx={{
                  textTransform: 'none',
                  background:
                    'linear-gradient(90deg,#0ea5a4,#0284c7)',
                }}
              >
                Login
              </Button>
            ) : (
              <>
                <Tooltip title="Open settings">
                  <Button
                    onClick={handleOpenUserMenu}
                    startIcon={
                      <Avatar alt={userName}>
                        {userName[0]?.toUpperCase()}
                      </Avatar>
                    }
                    sx={{ textTransform: 'none', color: 'text.primary' }}
                  >
                    {userName}
                  </Button>
                </Tooltip>

                <Menu
                  sx={{ mt: '45px' }}
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem
                      key={setting}
                      onClick={() => handleMenuClick(setting)}
                    >
                      <Typography textAlign="center">
                        {setting}
                      </Typography>
                    </MenuItem>
                  ))}

                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">
                      Logout
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

        </Toolbar>
      </div>
    </AppBar>
  );
}

export default ResponsiveAppBar;
