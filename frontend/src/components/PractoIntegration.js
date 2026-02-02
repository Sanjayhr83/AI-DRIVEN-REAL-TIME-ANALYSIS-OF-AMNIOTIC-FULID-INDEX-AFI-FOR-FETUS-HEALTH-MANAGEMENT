import React, { useState, useEffect, useRef } from 'react';
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
  Rating,
  InputAdornment,
  CircularProgress,
  Link
} from '@mui/material';
import { 
  Launch, 
  Search, 
  LocationOn, 
  AccessTime
} from '@mui/icons-material';
import externalBookingService from '../services/externalBookingService';

// Load Google Places Autocomplete
const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps && window.google.maps.places) {
    callback();
    return;
  }
  
  const script = document.createElement('script');
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  script.onerror = () => {
    console.warn('Google Maps API failed to load. Location autocomplete will not work.');
    callback(); // Continue anyway
  };
  document.head.appendChild(script);
};

const PractoIntegration = () => {
  const [searchType, setSearchType] = useState('location'); // 'location' or 'doctor'
  const [locationQuery, setLocationQuery] = useState('');
  const [doctorQuery, setDoctorQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    availability: 'all',
    rating: 0,
    sortBy: 'relevance',
  });
  
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (locationInputRef.current && window.google && window.google.maps && window.google.maps.places) {
        try {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            locationInputRef.current,
            {
              types: ['geocode', '(cities)'],
              componentRestrictions: { country: 'in' }, // Restrict to India
            }
          );
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) {
              setLocationQuery(place.formatted_address);
            }
          });
        } catch (err) {
          console.warn('Google Places Autocomplete initialization failed:', err);
        }
      }
    });
    
    // Fetch specialties
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const data = await externalBookingService.getSpecialties();
      setSpecialties(data);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
      // Fallback specialties
      setSpecialties(['Gynecologist', 'Obstetrician', 'Radiologist', 'Pediatrician']);
    }
  };

  const handleSearch = async () => {
    if (!locationQuery && !doctorQuery && !specialty) {
      setError('Please enter a location, doctor name, or select a specialty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const searchFilters = {
        location: searchType === 'location' ? locationQuery : '',
        name: searchType === 'doctor' ? doctorQuery : '',
        specialty: specialty,
        availability: filters.availability !== 'all' ? filters.availability : '',
        rating: filters.rating,
      };

      const results = await externalBookingService.searchDoctors(searchFilters);
      
      // Sort results
      let sortedResults = [...results];
      if (filters.sortBy === 'rating') {
        sortedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (filters.sortBy === 'experience') {
        sortedResults.sort((a, b) => (b.experience || 0) - (a.experience || 0));
      } else if (filters.sortBy === 'fee') {
        sortedResults.sort((a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0));
      }

      setDoctors(sortedResults);
    } catch (error) {
      setError('Failed to search doctors. Please try again.');
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const DoctorCard = ({ doctor }) => {
    const doctorName = doctor.name || 'Dr. Unknown';
    const initials = doctorName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    return (
      <Card sx={{ 
        mb: 2, 
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        '&:hover': { boxShadow: 6 } 
      }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3} md={2}>
              <Avatar
                src={doctor.avatar}
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto',
                  bgcolor: '#2E7D32',
                  fontSize: '2rem',
                  fontWeight: 700
                }}
              >
                {initials}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm={9} md={10}>
              <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Dr. {doctorName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {doctor.specialty || 'General'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Rating value={doctor.rating || 4.5} readOnly size="small" precision={0.1} />
                    <Typography variant="body2">
                      {doctor.rating || 4.5} ({doctor.reviews_count || 0} reviews)
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                    <Chip
                      icon={<AccessTime />}
                      label={`${doctor.experience || 0} years exp`}
                      size="small"
                    />
                    <Chip
                      icon={<LocationOn />}
                      label={doctor.location || doctor.city || 'N/A'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {doctor.clinic_name || 'Private Clinic'}
                  </Typography>
                </Box>
                <Box textAlign="right" sx={{ minWidth: 150 }}>
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    ₹{doctor.consultation_fee || 500}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    Consultation Fee
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mb: 1 }}
                    onClick={() => {
                      // Book appointment - redirect to internal booking
                      window.location.href = `/appointments?doctor=${doctor.id}`;
                    }}
                  >
                    Book Appointment
                  </Button>
                  {doctor.next_available && (
                    <Typography variant="caption" color="success.main" display="block" mt={1}>
                      Next available: {doctor.next_available}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    startIcon={<Launch />}
                    onClick={() => {
                      // Open Practo profile - search by doctor name and specialty
                      const searchQuery = encodeURIComponent(`${doctorName} ${doctor.specialty || ''} ${doctor.location || doctor.city || ''}`);
                      const practoUrl = `https://www.practo.com/search?results_type=doctor&q=${searchQuery}`;
                      window.open(practoUrl, '_blank');
                    }}
                  >
                    View on Practo
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3, marginTop: 8, marginBottom: 6 }}>
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #1976D2 0%, #42a5f5 100%)',
        color: 'white'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Find Doctors Near You
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Search and book appointments with specialists
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Type Toggle */}
          <Grid item xs={12}>
            <Box display="flex" gap={1} mb={2}>
              <Chip
                label="Search by Location"
                onClick={() => setSearchType('location')}
                color={searchType === 'location' ? 'primary' : 'default'}
                variant={searchType === 'location' ? 'filled' : 'outlined'}
                clickable
              />
              <Chip
                label="Search by Doctor Name"
                onClick={() => setSearchType('doctor')}
                color={searchType === 'doctor' ? 'primary' : 'default'}
                variant={searchType === 'doctor' ? 'filled' : 'outlined'}
                clickable
              />
            </Box>
          </Grid>

          {/* Location/Doctor Search */}
          <Grid item xs={12} md={4}>
            {searchType === 'location' ? (
              <TextField
                fullWidth
                inputRef={locationInputRef}
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter city, locality or pincode"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <TextField
                fullWidth
                value={doctorQuery}
                onChange={(e) => setDoctorQuery(e.target.value)}
                placeholder="Search doctor by name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Grid>

          {/* Specialty */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                label="Specialty"
              >
                <MenuItem value="">All Specialties</MenuItem>
                {specialties.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Availability Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                label="Availability"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="tomorrow">Tomorrow</MenuItem>
                <MenuItem value="this_week">This Week</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Search Button */}
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>

        {/* Filters Row */}
        <Box display="flex" gap={2} mt={2} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              label="Sort By"
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
              <MenuItem value="experience">Most Experienced</MenuItem>
              <MenuItem value="fee">Lowest Fee</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Min Rating</InputLabel>
            <Select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              label="Min Rating"
            >
              <MenuItem value={0}>All Ratings</MenuItem>
              <MenuItem value={3}>3+ Stars</MenuItem>
              <MenuItem value={4}>4+ Stars</MenuItem>
              <MenuItem value={4.5}>4.5+ Stars</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Results */}
      <Box>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : doctors.length > 0 ? (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
            </Typography>
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id || doctor._id} doctor={doctor} />
            ))}
          </>
        ) : (
          <Paper>
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Search sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No doctors found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or location
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Info Section */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 3, bgcolor: '#f8fafc' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          About Practo Integration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Practo is India's leading healthcare platform. You can view doctor profiles on Practo 
          and book appointments directly through our platform or on Practo.
        </Typography>
        <Link 
          href="https://www.practo.com" 
          target="_blank" 
          sx={{ color: '#1976D2', fontWeight: 500 }}
        >
          Visit Practo.com →
        </Link>
      </Paper>
      <Box component="footer" sx={{ mt: 6, textAlign: "center", color: "text.secondary" }}>
         <Typography variant="body2">Developed by <b>Team SPSY</b> &copy; {new Date().getFullYear()} | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a></Typography>
      </Box>
    </Box>
  );
};

export default PractoIntegration;
