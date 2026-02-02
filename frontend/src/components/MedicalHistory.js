import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  LocalHospital,
  Medication,
  Science,
  Image as ImageIcon,
  Assignment,
  Event,
  CalendarToday
} from '@mui/icons-material';
import axios from 'axios';

const MedicalHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMedicalHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/medical-history?filter=${filter}`,
        { 
          headers: { 
            Authorization: `Bearer ${user.access_token || ''}` 
          } 
        }
      );
      setHistory(response.data);
    } catch (error) {
      setError('Failed to load medical history');
      console.error('Failed to fetch medical history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'appointment': return <Event />;
      case 'test': return <Science />;
      case 'prescription': return <Medication />;
      case 'ultrasound': return <ImageIcon />;
      case 'report': return <Assignment />;
      default: return <LocalHospital />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'appointment': return 'primary';
      case 'test': return 'secondary';
      case 'prescription': return 'success';
      case 'ultrasound': return 'info';
      case 'report': return 'warning';
      default: return 'grey';
    }
  };

  const getEventLabel = (type) => {
    switch (type) {
      case 'appointment': return 'Appointment';
      case 'test': return 'Test';
      case 'prescription': return 'Prescription';
      case 'ultrasound': return 'Ultrasound';
      case 'report': return 'Report';
      default: return 'Medical Event';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #9C27B0 0%, #E1BEE7 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
        marginTop: 6
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Medical History
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Complete timeline of your medical records and appointments
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            label="All"
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
            variant={filter === 'all' ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label="Appointments"
            onClick={() => setFilter('appointment')}
            color={filter === 'appointment' ? 'primary' : 'default'}
            variant={filter === 'appointment' ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label="Tests & Ultrasounds"
            onClick={() => setFilter('test')}
            color={filter === 'test' ? 'primary' : 'default'}
            variant={filter === 'test' ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label="Prescriptions"
            onClick={() => setFilter('prescription')}
            color={filter === 'prescription' ? 'primary' : 'default'}
            variant={filter === 'prescription' ? 'filled' : 'outlined'}
            clickable
          />
          <Chip
            label="Reports"
            onClick={() => setFilter('report')}
            color={filter === 'report' ? 'primary' : 'default'}
            variant={filter === 'report' ? 'filled' : 'outlined'}
            clickable
          />
        </Box>
      </Paper>

      {/* Timeline */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : history.length > 0 ? (
        <Timeline position="alternate">
          {history.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineOppositeContent
                sx={{ m: 'auto 0' }}
                align="right"
                variant="body2"
                color="text.secondary"
              >
                <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
                  <CalendarToday sx={{ fontSize: 16 }} />
                  <Typography variant="body2" fontWeight={500}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color={getEventColor(event.type)} sx={{ width: 48, height: 48 }}>
                  {getEventIcon(event.type)}
                </TimelineDot>
                {index < history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Card sx={{ 
                  maxWidth: 400,
                  '&:hover': { boxShadow: 4 }
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip
                        label={getEventLabel(event.type)}
                        size="small"
                        color={getEventColor(event.type)}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {event.description}
                    </Typography>
                    {event.details && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => {
                          // Navigate to detail page or show details
                          if (event.type === 'ultrasound') {
                            window.location.href = `/analysis-history`;
                          } else if (event.type === 'appointment') {
                            window.location.href = `/appointments`;
                          } else if (event.type === 'prescription' || event.type === 'report') {
                            window.location.href = `/health-records`;
                          }
                        }}
                      >
                        View Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <Paper>
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <LocalHospital sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No medical history records found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your medical history will appear here as you use the platform
            </Typography>
          </Box>
        </Paper>
      )}
      <Box component="footer" sx={{ mt: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">Developed by <b>Team SPSY</b> &copy; {new Date().getFullYear()} | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a></Typography>
       </Box>
    </Box>
  );
};

export default MedicalHistory;
