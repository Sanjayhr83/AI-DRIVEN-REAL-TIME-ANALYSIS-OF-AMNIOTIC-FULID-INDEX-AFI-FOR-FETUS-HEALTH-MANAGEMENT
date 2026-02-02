import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Upload,
  Folder,
  Description,
  Image as ImageIcon,
  Download,
  Delete,
  Visibility,
  Add,
  Medication,
  Science,
  Assignment,
  Close
} from '@mui/icons-material';
import healthRecordsService from '../services/healthRecordsService';

// Helper to get file extension
const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
};

const CATEGORIES = [
  { value: 'ultrasound', label: 'Ultrasound Reports', icon: <ImageIcon /> },
  { value: 'lab_test', label: 'Lab Tests', icon: <Science /> },
  { value: 'prescription', label: 'Prescriptions', icon: <Medication /> },
  { value: 'medical_report', label: 'Medical Reports', icon: <Assignment /> },
  { value: 'other', label: 'Other Documents', icon: <Description /> },
];

const HealthRecords = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    category: 'ultrasound',
    title: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const category = activeCategory === 'all' ? null : activeCategory;
      const data = await healthRecordsService.getRecords(category);
      setRecords(data || []);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load health records';
      setError(errorMsg);
      console.error('Health records fetch error:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload PDF, JPEG, or PNG files only.');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Maximum size is 10MB.');
        return;
      }
      
      setUploadData({ 
        ...uploadData, 
        file, 
        title: file.name.replace(/\.[^/.]+$/, '') // Remove extension
      });
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      setError('Please select a file');
      return;
    }
    if (!uploadData.title) {
      setError('Please enter a title');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await healthRecordsService.uploadRecord(uploadData.file, {
        category: uploadData.category,
        title: uploadData.title,
        date: uploadData.date,
        notes: uploadData.notes,
      });
      
      setSuccess('File uploaded successfully');
      setUploadDialogOpen(false);
      setUploadData({
        file: null,
        category: 'ultrasound',
        title: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchRecords();
      
      // Notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('healthRecordUploaded'));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (record) => {
    try {
      const blob = await healthRecordsService.downloadRecord(record.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.title + getFileExtension(record.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file');
      console.error(err);
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await healthRecordsService.deleteRecord(recordId);
        setSuccess('Record deleted successfully');
        fetchRecords();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete record');
        console.error(err);
      }
    }
  };

  const RecordCard = ({ record }) => {
    const category = CATEGORIES.find(c => c.value === record.category);
    
    return (
      <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box display="flex" gap={2} flex={1}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                {category?.icon || <Description />}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {record.title}
                </Typography>
                <Chip 
                  label={category?.label || 'Other'} 
                  size="small" 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {new Date(record.date).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {record.notes && (
            <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {record.notes}
            </Typography>
          )}
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => {
                const fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${record.file_url}`;
                window.open(fileUrl, '_blank');
              }}
            >
              View
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleDownload(record)}
            >
              Download
            </Button>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDelete(record.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Get statistics
  const stats = {
    total: records.length,
    normal: records.filter(r => r.category === 'ultrasound' && r.title?.toLowerCase().includes('normal')).length,
    abnormal: records.filter(r => r.category === 'ultrasound' && !r.title?.toLowerCase().includes('normal')).length
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 , marginTop: 8, marginBottom: 8}}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Health Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{ bgcolor: '#2E7D32' }}
        >
          Upload Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                {stats.total}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976D2' }}>
                {stats.normal}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Normal Results
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ED6C02' }}>
                {stats.abnormal}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Abnormal Results
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 3 }}>
        <Tabs
          value={activeCategory}
          onChange={(e, newValue) => setActiveCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Records" value="all" icon={<Folder />} iconPosition="start" />
          {CATEGORIES.map(cat => (
            <Tab 
              key={cat.value}
              label={cat.label} 
              value={cat.value}
              icon={cat.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Records Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : records.length > 0 ? (
        <Grid container spacing={3}>
          {records.map(record => (
            <Grid item xs={12} md={6} lg={4} key={record.id}>
              <RecordCard record={record} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No records found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Upload your medical documents to keep them organized
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload First Document
            </Button>
          </Box>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => !loading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Upload Health Record
          </Typography>
          <IconButton 
            onClick={() => setUploadDialogOpen(false)} 
            disabled={loading}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
              sx={{ py: 2 }}
            >
              {uploadData.file ? uploadData.file.name : 'Select File (PDF, JPEG, PNG)'}
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </Button>
            
            {uploadData.file && (
              <Typography variant="caption" color="text.secondary">
                File size: {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            )}

            <TextField
              label="Document Title"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadData.category}
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                label="Category"
              >
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              value={uploadData.date}
              onChange={(e) => setUploadData({ ...uploadData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              value={uploadData.notes}
              onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
              fullWidth
              placeholder="Add any additional notes about this record..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setUploadDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={loading || !uploadData.file || !uploadData.title}
            startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      <Box component="footer" sx={{ mt: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">Developed by <b>Team SPSY</b> &copy; {new Date().getFullYear()} | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a></Typography>
       </Box>
    </Box>
  );
};

export default HealthRecords;
