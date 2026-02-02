import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Schedule,
  History,
  LocalHospital,
  CalendarToday,
  AccessTime,
  Person,
  TipsAndUpdates,
  Favorite,
  Assessment,
  MonitorHeart,
  CloudUpload
} from '@mui/icons-material';
import authService from '../services/authService';
import predictionService from '../services/predictionService';
import historyService from '../services/historyService';
import appointmentService from '../services/appointmentService';
import MedicalAFIAnalysis from './MedicalAFIAnalysis';

const PatientDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    appointments: 0,
    testResults: 0,
    doctors: 0,
    pregnancyWeek: 0
  });
  const navigate = useNavigate();

  // Function to refresh dashboard data
  const refreshDashboardData = useCallback(async () => {
    try {
      console.log('Refreshing dashboard data...');
      
      // Force fresh data fetch
      const [profile, history, appointments] = await Promise.all([
        authService.getUserProfile().catch(() => null),
        historyService.getPredictionHistory().catch(() => []),
        appointmentService.getMyAppointments().catch(() => [])
      ]);
      
      if (profile) {
        setUserDetails(profile);
      }
      
      console.log('Fresh prediction history:', history);
      console.log('Fresh history length:', history.length);
      
      setRecentAnalyses(history.slice(0, 3));
      
      console.log('All appointments fetched:', appointments);
      
      const uniqueDoctors = new Set(appointments.map(apt => apt.doctor_id).filter(Boolean));
      const currentProfile = profile || userDetails;
      const pregnancyWeek = currentProfile?.pregnancy_week || currentProfile?.pregnancyWeek || null;
      
      const newStats = {
        appointments: appointments.length, // Show total appointments, not just this month
        testResults: history.length,
        doctors: uniqueDoctors.size,
        pregnancyWeek: pregnancyWeek || 0
      };
      
      console.log('Updated dashboard stats:', newStats);
      setDashboardStats(newStats);
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  }, [userDetails]);

  const fetchAppointments = useCallback(async () => {
    try {
      const appointments = await appointmentService.getMyAppointments();
      const now = new Date();
      const upcoming = appointments
        .filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= now && apt.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 2)
        .map(apt => ({
          id: apt.id,
          doctor: apt.doctor_name || 'Dr. Unknown',
          specialty: apt.specialty || 'General',
          date: apt.date,
          time: apt.time_slot,
          type: apt.reason || 'Consultation',
          status: apt.status || 'scheduled'
        }));
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setUpcomingAppointments([]);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/');
        return;
      }
      
      try {
        const profile = await authService.getUserProfile();
        setUserDetails(profile || user);
        await refreshDashboardData();
        await fetchAppointments();
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setUserDetails(user);
      }
    };
    
    fetchUserData();
  }, [navigate, refreshDashboardData, fetchAppointments]);

  useEffect(() => {
    const handleAppointmentBooked = () => {
      setTimeout(async () => {
        await refreshDashboardData();
        await fetchAppointments();
      }, 1000);
    };
    
    const handleHealthRecordUploaded = () => {
      setTimeout(async () => {
        await refreshDashboardData();
      }, 1000);
    };
    
    const handleProfileUpdated = () => {
      setTimeout(async () => {
        await refreshDashboardData();
      }, 500);
    };
    
    const handleImageAnalyzed = () => {
      setTimeout(async () => {
        await refreshDashboardData();
      }, 1000);
    };
    
    const handleDashboardRefresh = () => {
      setTimeout(async () => {
        await refreshDashboardData();
        await fetchAppointments();
      }, 500);
    };
    
    window.addEventListener('appointmentBooked', handleAppointmentBooked);
    window.addEventListener('healthRecordUploaded', handleHealthRecordUploaded);
    window.addEventListener('profileUpdated', handleProfileUpdated);
    window.addEventListener('imageAnalyzed', handleImageAnalyzed);
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('appointmentBooked', handleAppointmentBooked);
      window.removeEventListener('healthRecordUploaded', handleHealthRecordUploaded);
      window.removeEventListener('profileUpdated', handleProfileUpdated);
      window.removeEventListener('imageAnalyzed', handleImageAnalyzed);
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, [refreshDashboardData, fetchAppointments]);

  // Disabled periodic refresh to prevent infinite loop
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     await refreshDashboardData();
  //   }, 30000);
  //   
  //   return () => clearInterval(interval);
  // }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setPredictionResult(null);
      setPredictionError('');
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setIsPredicting(true);
    setPredictionError('');

    try {
      const result = await predictionService.predictImage(selectedImage);
      console.log('Prediction result:', result);
      setPredictionResult(result);
      
      // Force immediate refresh of test results count
      console.log('Refreshing dashboard after prediction...');
      await refreshDashboardData();
      
      // Additional refresh after delay
      setTimeout(async () => {
        console.log('Second refresh after prediction...');
        await refreshDashboardData();
      }, 3000);
    } catch (error) {
      setPredictionError(error.message || 'Failed to analyze image');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleCloseUploadDialog = () => {
    const hadPrediction = predictionResult !== null;
    setUploadDialog(false);
    setSelectedImage(null);
    setImagePreview(null);
    setPredictionResult(null);
    setPredictionError('');
    
    if (hadPrediction) {
      // Immediate refresh when closing after successful prediction
      refreshDashboardData();
      
      // Additional refresh after delay
      setTimeout(async () => {
        await refreshDashboardData();
      }, 1000);
    }
  };

  const quickActions = [
    { 
      title: 'Upload Image', 
      subtitle: 'Analyze ultrasound',
      icon: <CloudUpload />, 
      color: '#2E7D32', 
      action: () => setUploadDialog(true) 
    },
    { 
      title: 'Book Appointment', 
      subtitle: 'Schedule with doctors',
      icon: <Schedule />, 
      color: '#1976D2', 
      action: () => navigate('/appointments') 
    },
    { 
      title: 'Analysis History', 
      subtitle: 'View past results',
      icon: <History />, 
      color: '#ED6C02', 
      action: () => navigate('/analysis-history') 
    },
    { 
      title: 'Health Records', 
      subtitle: 'Test results & reports',
      icon: <LocalHospital />, 
      color: '#9C27B0', 
      action: () => navigate('/health-records') 
    }
  ];

  const recentResults = recentAnalyses.length > 0 ? recentAnalyses.map(analysis => ({
    date: new Date(analysis.created_at).toLocaleDateString(),
    test: 'AFI Analysis',
    result: analysis.class_prediction,
    confidence: `${((analysis.confidence || 0) * 100).toFixed(1)}%`,
    status: analysis.class_prediction?.toLowerCase() === 'normal' ? 'normal' : 'abnormal',
    doctor: 'Dr. System'
  })) : [];

  const healthStats = [
    { title: 'Appointments', value: dashboardStats.appointments.toString(), subtitle: 'Total', color: '#2E7D32', icon: <Schedule /> },
    { title: 'Test Results', value: dashboardStats.testResults.toString(), subtitle: 'Analyses', color: '#1976D2', icon: <Assessment /> },
    { title: 'Doctors', value: dashboardStats.doctors.toString(), subtitle: 'Consulted', color: '#ED6C02', icon: <Person /> },
    { title: 'Pregnancy', value: dashboardStats.pregnancyWeek > 0 ? dashboardStats.pregnancyWeek.toString() : 'N/A', subtitle: dashboardStats.pregnancyWeek > 0 ? 'Weeks' : 'Not Set', color: '#9C27B0', icon: <MonitorHeart /> }
  ];

  const healthTips = [
    {
      title: 'Stay Hydrated',
      description: 'Drink 8-10 glasses of water daily for optimal health during pregnancy.',
      icon: <Favorite sx={{ color: '#e91e63' }} />
    },
    {
      title: 'Regular Checkups',
      description: 'Schedule prenatal appointments every 2-4 weeks for monitoring.',
      icon: <Schedule sx={{ color: '#2E7D32' }} />
    },
    {
      title: 'Healthy Diet',
      description: 'Include folic acid, iron, and calcium-rich foods in your diet.',
      icon: <TipsAndUpdates sx={{ color: '#ED6C02' }} />
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: 4, maxWidth: '1400px', mx: 'auto' ,marginTop: 6 }}>
      {/* Welcome Banner */}
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #9C27B0 0%, #E1BEE7 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {userDetails?.full_name?.split(' ')[0] || 'Patient'}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage your health journey with ease
          </Typography>
        </Box>
        <Box sx={{ 
          position: 'absolute', 
          right: -50, 
          top: -50, 
          width: 200, 
          height: 200, 
          borderRadius: '50%', 
          bgcolor: 'rgba(255,255,255,0.1)' 
        }} />
      </Paper>

      {/* Health Stats */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {healthStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)' 
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${stat.color}15`,
                    color: stat.color 
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                  {stat.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            mb: 4
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Button
                    variant="outlined"
                    onClick={action.action}
                    sx={{
                      width: '100%',
                      p: 3,
                      borderRadius: 2,
                      borderColor: '#e2e8f0',
                      color: action.color,
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      '&:hover': { 
                        borderColor: action.color,
                        bgcolor: `${action.color}08`
                      }
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      {action.icon}
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.subtitle}
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Health Tips */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
              Health Tips
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {healthTips.map((tip, index) => (
                <Box key={index} sx={{ 
                  p: 3, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateX(4px)' }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}>
                      {tip.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                        {tip.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tip.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Appointments & Results */}
        <Grid item xs={12} md={6}>
          {/* Upcoming Appointments */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            mb: 4
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
              Upcoming Appointments
            </Typography>
            <List sx={{ p: 0 }}>
              {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: '#2E7D3215',
                        color: '#2E7D32'
                      }}>
                        <CalendarToday />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {appointment.doctor}
                          </Typography>
                          <Chip 
                            label={appointment.status} 
                            size="small" 
                            sx={{ 
                              bgcolor: appointment.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                              color: appointment.status === 'confirmed' ? '#166534' : '#92400e',
                              fontWeight: 600
                            }} 
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {appointment.specialty} • {appointment.type}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 14 }} />
                              {appointment.date}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 14 }} />
                              {appointment.time}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < upcomingAppointments.length - 1 && <Divider />}
                </React.Fragment>
              )) : (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary" align="center" py={2}>
                        No upcoming appointments
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
            <Button
              variant="text"
              onClick={() => navigate('/appointments')}
              sx={{ color: '#2E7D32', mt: 2, fontWeight: 600, textTransform: 'none' }}
            >
              View All Appointments
            </Button>
          </Paper>

          {/* Recent Results */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
              Recent Results
            </Typography>
            <List sx={{ p: 0 }}>
              {recentResults.length > 0 ? recentResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: '#1976D215',
                        color: '#1976D2'
                      }}>
                        <LocalHospital />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {result.test}
                          </Typography>
                          <Chip 
                            label={result.result} 
                            size="small" 
                            sx={{ 
                              bgcolor: result.status === 'normal' ? '#dcfce7' : '#fecaca',
                              color: result.status === 'normal' ? '#166534' : '#dc2626',
                              fontWeight: 600
                            }} 
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 14 }} />
                              {result.date}
                            </Typography>
                            {result.doctor && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Person sx={{ fontSize: 14 }} />
                                {result.doctor}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentResults.length - 1 && <Divider />}
                </React.Fragment>
              )) : (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary" align="center" py={2}>
                        No recent results yet
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
            <Button
              variant="text"
              onClick={() => navigate('/analysis-history')}
              sx={{ color: '#1976D2', mt: 2, fontWeight: 600, textTransform: 'none' }}
            >
              View All Results
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={handleCloseUploadDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Upload Ultrasound Image
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                mb: 3,
                bgcolor: imagePreview ? 'transparent' : '#f8fafc',
                cursor: 'pointer',
                '&:hover': { borderColor: '#2E7D32', bgcolor: '#f0fdf4' }
              }}
              onClick={() => document.getElementById('patient-image-upload').click()}
            >
              {imagePreview ? (
                <Box>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '12px'
                    }}
                  />
                  <Typography variant="body1" sx={{ mt: 2, color: '#64748b' }}>
                    Click to change image
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Upload Your Ultrasound Image
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Click to select your ultrasound image for analysis
                  </Typography>
                </Box>
              )}
            </Box>

            <input
              id="patient-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {predictionError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {predictionError}
              </Alert>
            )}

            {predictionResult && (
              <Box sx={{ mt: 3 }}>
                <MedicalAFIAnalysis 
                  predictionResult={predictionResult}
                  gestationalWeek={32}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          {selectedImage && (
            <Button
              variant="contained"
              onClick={handleAnalyzeImage}
              disabled={isPredicting}
              sx={{ bgcolor: '#2E7D32' }}
            >
              {isPredicting ? 'Analyzing...' : 'Analyze Image'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Box component="footer" sx={{ mt: 6, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">Developed by <b>Team SPSY</b> &copy; {new Date().getFullYear()} | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a></Typography>
        </Box>
    </Box>
  );
};

export default PatientDashboard;