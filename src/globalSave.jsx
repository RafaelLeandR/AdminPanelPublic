import React, { createContext, useContext, useMemo, useState } from 'react';
import { Backdrop, Box, CircularProgress, LinearProgress, Typography } from '@mui/material';

const SaveProgressContext = createContext(null);

export function useSaveProgress() {
  return useContext(SaveProgressContext);
}

export function SaveProgressProvider({ children }) {
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Salvando...');

  const startSaving = (initialMessage = 'Salvando...') => {
    setSaving(true);
    setProgress(0);
    setMessage(initialMessage);
  };

  const updateProgress = (value, newMessage) => {
    setProgress(value);
    if (newMessage) setMessage(newMessage);
  };

  const finishSaving = () => {
    setProgress(100);
    setTimeout(() => {
      setSaving(false);
      setProgress(0);
      setMessage('Salvando...');
    }, 400);
  };

  const failSaving = () => {
    setSaving(false);
    setProgress(0);
    setMessage('Salvando...');
  };

  const value = useMemo(
    () => ({
      saving,
      progress,
      message,
      startSaving,
      updateProgress,
      finishSaving,
      failSaving,
    }),
    [saving, progress, message]
  );

  return (
    <SaveProgressContext.Provider value={value}>
      {children}

      <Backdrop
        open={saving}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2000 }}
      >
        <Box
          sx={{
            width: 360,
            bgcolor: 'background.paper',
            color: 'text.primary',
            p: 3,
            borderRadius: 2,
            boxShadow: 6,
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <CircularProgress size={24} />
            <Typography variant="h6">{message}</Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 999 }}
          />

          <Typography variant="body2" mt={1}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      </Backdrop>
    </SaveProgressContext.Provider>
  );
}