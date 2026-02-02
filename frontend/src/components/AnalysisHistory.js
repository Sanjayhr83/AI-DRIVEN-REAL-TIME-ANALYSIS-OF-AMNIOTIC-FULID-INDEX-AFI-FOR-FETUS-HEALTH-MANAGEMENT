import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button
} from '@mui/material';
import { Assessment, CalendarToday, Close, Visibility } from '@mui/icons-material';
import historyService from '../services/historyService';
import MedicalAFIAnalysis from './MedicalAFIAnalysis';

const AnalysisHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await historyService.getPredictionHistory();
        setPredictions(history);
      } catch (err) {
        setError('Failed to load analysis history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusColor = (prediction) => {
    switch (prediction.toLowerCase()) {
      case 'normal': return { bgcolor: '#dcfce7', color: '#166534' };
      case 'low': return { bgcolor: '#fef3c7', color: '#92400e' };
      case 'high': return { bgcolor: '#fbc7c7ff', color: '#ef0000ff' };
      default: return { bgcolor: '#f3f4f6', color: '#374151' };
    }
  };

  const handleViewDetails = (prediction) => {
    setSelectedPrediction(prediction);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedPrediction(null);
  };

  const formatPredictionForAnalysis = (prediction) => {
    return {
      class: prediction.class_prediction,
      prediction: prediction.class_prediction,
      confidence: prediction.confidence,
      probabilities: prediction.probabilities || {}
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto',marginTop: 6, marginBottom: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Assessment sx={{ fontSize: '2rem', color: '#2E7D32', mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Analysis History
        </Typography>
      </Box>

      {predictions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Assessment sx={{ fontSize: '4rem', color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No Analysis History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your first ultrasound image to see analysis results here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Result</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Confidence</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: '1rem', color: '#64748b' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(prediction.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(prediction.created_at).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {prediction.image_filename || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={prediction.class_prediction}
                      sx={{
                        ...getStatusColor(prediction.class_prediction),
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {(prediction.confidence * 100).toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(prediction)}
                      sx={{
                        textTransform: 'none',
                        borderColor: '#2E7D32',
                        color: '#2E7D32',
                        '&:hover': {
                          borderColor: '#1B5E20',
                          bgcolor: '#f0fdf4'
                        }
                      }}
                    >
                      View Analysis
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Detailed Analysis
          </Typography>
          <IconButton onClick={handleCloseDetailDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedPrediction && (
            <Box sx={{ p: 3 }}>
              <MedicalAFIAnalysis
                predictionResult={formatPredictionForAnalysis(selectedPrediction)}
                gestationalWeek={32}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <Box component="footer" sx={{ mt: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">Developed by <b>Team SPSY</b> &copy; {new Date().getFullYear()} | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a></Typography>
      </Box>
    </Box>
  );
};

export default AnalysisHistory;