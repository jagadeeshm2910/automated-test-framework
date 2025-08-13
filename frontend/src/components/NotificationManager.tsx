import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';

const NotificationManager: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const handleClose = (id: string) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id,
    });
  };

  return (
    <>
      {state.notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.type === 'error' ? 8000 : 4000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          sx={{
            position: 'relative',
            '& .MuiSnackbar-root': {
              position: 'static',
              transform: 'none',
            },
            mb: state.notifications.indexOf(notification) > 0 ? 1 : 0,
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => handleClose(notification.id)}
              >
                <Close fontSize="small" />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationManager;
