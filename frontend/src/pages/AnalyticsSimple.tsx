import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';

const Analytics: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive insights into your UI testing performance
      </Typography>

      <Card>
        <CardContent>
          <Alert severity="info">
            This page will display charts, graphs, and performance metrics.
            <br />
            Start the backend API server to enable this functionality.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Analytics;
