import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import doctors from './DD';

const Doctors = () => {
  const [activeMap, setActiveMap] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const toggleMap = (id) => {
    setActiveMap(activeMap === id ? null : id);
  };

  const toggleDetails = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fa', py: 6,  }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#1B5E20'}}>Ours Doctors</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>The Expert Surgeons for AFI Management</Typography>

        <Grid container spacing={3}>
          {doctors.map((doc) => (
            <Grid item xs={12} md={6} key={doc.id}>
              <Card>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{doc.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{doc.Hospital || doc.location}</Typography>
                    <Typography variant="caption" color="text.secondary">{doc.specialty} • {doc.experience}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={() => toggleDetails(doc.id)}>{expanded === doc.id ? 'Hide Details' : 'Details'}</Button>
                    <Button variant="contained" onClick={() => toggleMap(doc.id)} sx={{ bgcolor: '#2E7D32' }}>{activeMap === doc.id ? 'Hide Map' : 'View Map'}</Button>
                  </Box>
                </CardContent>

                {expanded === doc.id && (
                  <CardContent sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <Typography variant="body2"><strong>Specialty:</strong> {doc.specialty}</Typography>
                    <Typography variant="body2"><strong>Experience:</strong> {doc.experience}</Typography>
                    <Typography variant="body2"><strong>Rating:</strong> {doc.rating} / 5</Typography>
                    <Typography variant="body2"><strong>Education:</strong> {doc.education}</Typography>
                    <Typography variant="body2"><strong>College:</strong> {doc.College}</Typography>
                    <Typography variant="body2"><strong>Consultation Fee:</strong> {doc.consultationFee}</Typography>
                  </CardContent>
                )}

                {activeMap === doc.id && (
                  <Box sx={{ p: 2 }}>
                    {doc.map ? (
                      <div style={{ position: 'relative', paddingBottom: '65%', height: 0 }}>
                        <iframe
                          title={`map-${doc.id}`}
                          src={doc.map}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Map not available</Typography>
                    )}
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Box component="footer" sx={{ mt: 6, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">Developed by <b>Team SPSY</b> &copy; {new Date().getFullYear()} | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a></Typography>
      </Box>
    </Box>
  );
};

export default Doctors;

/*
  Note: doctor data is imported from `DD.js` which exports an array of doctor records.
*/
