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
import AdbIcon from '@mui/icons-material/Adb';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const loadUser = React.useCallback(() => {
    try {
      const raw = localStorage.getItem('ds_user') ?? sessionStorage.getItem('ds_user');
      if (raw) {
        const u = JSON.parse(raw);
        // prefer fields name, fullName, or email fallback
        setUserName(u?.fullName ?? u?.name ?? u?.email ?? String(u));
      } else {
        setUserName(null);
      }
    } catch (err) {
      setUserName(null);
    }
  }, []);

  React.useEffect(() => {
    loadUser();

    // optional: respond to other tabs logging in/out
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ds_user' || e.key === 'ds_token') {
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
    // route to relevant pages - adapt paths to your routing
    switch (setting) {
      case 'Profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };


  const handleLogout = () => {
    // clear auth data (adjust keys if you use different ones)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('ds_user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('ds_user');

    setUserName(null);
    handleCloseUserMenu();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar position="fixed" className="!fixed !top-0 !left-0 !right-0 !z-50">
      <div className="w-full px-4">
        <Toolbar disableGutters className="flex justify-between items-center">
          {/* Left Side - Logo */}
          <div 
          className="flex items-center cursor-pointer"
          onClick={handleLogoClick}>
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              LOGO
            </Typography>
          </div>

          {/* Mobile Menu Icon */}
          <Box 
          sx={{ display: { xs: 'flex', md: 'none' } }}
          onClick={handleLogoClick}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
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
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.path}
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate(page.path);
                  }}
                >
                  <Typography sx={{ textAlign: 'center' }}>{page.label}</Typography>
                  </MenuItem>
              ))}

            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
            <AdbIcon sx={{ mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              LOGO
            </Typography>
          </Box>

          {/* Center - Menu Items */}
          <Box 
            sx={{ 
              display: { xs: 'none', md: 'flex' },
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {pages.map((page) => (
            <Button
              key={page.path}
              onClick={() => navigate(page.path)}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              {page.label}
            </Button>
          ))}

          </Box>

          {/* Right Side - Avatar */}
           <Box>
            {!userName ? (
              // Not logged in -> show Login button
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                sx={{ textTransform: 'none', background: 'linear-gradient(90deg,#0ea5a4,#0284c7)' }}
              >
                Login
              </Button>
            ) : (
              // Logged in -> show user name + menu
              <>
                <Tooltip title="Open settings">
                  <Button
                    onClick={handleOpenUserMenu}
                    startIcon={<Avatar alt={userName} src="/static/images/avatar/2.jpg" />}
                    sx={{ textTransform: 'none', color: 'white' }}
                  >
                    {userName}
                  </Button>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="user-menu"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
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
                      onClick={() => {
                        handleMenuClick(setting);
                      }}
                    >
                      <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                    </MenuItem>
                  ))}

                  <MenuItem
                    onClick={() => {
                      handleLogout();
                    }}
                  >
                    <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
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
