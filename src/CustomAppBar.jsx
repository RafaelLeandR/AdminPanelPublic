import * as React from 'react';
import { AppBar, UserMenu } from 'react-admin';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const CustomUserMenu = () => (
  <UserMenu>
    <Button type="button"
      component={Link}
      to="/minha-conta"
      sx={{ width: '100%', justifyContent: 'flex-start', p: 1.5 }}
    >
      Minha conta
    </Button>
  </UserMenu>
);

const CustomAppBar = () => (
  <AppBar userMenu={<CustomUserMenu />}>
    <Typography flex="1" variant="h6" id="react-admin-title" />
    <Box sx={{ mr: 2 }}>
      <Button type="button"
        color="inherit"
        component={Link}
        to="/minha-conta"
      >
        Minha conta
      </Button>
    </Box>
  </AppBar>
);

export default CustomAppBar;