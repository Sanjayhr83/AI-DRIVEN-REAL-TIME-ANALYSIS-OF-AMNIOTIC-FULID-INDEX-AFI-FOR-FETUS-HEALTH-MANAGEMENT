import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Favorite,
  LocalHospital,
  TrendingUp,
  Info
} from '@mui/icons-material';

const MedicalAFIAnalysis = ({ predictionResult, gestationalWeek = 32 }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!predictionResult) return null;

  // Extract data from prediction result
  const classification = predictionResult.class || predictionResult.prediction || 'Normal';
  const confidence = predictionResult.confidence || 0;
  const probabilities = predictionResult.probabilities || {};

  // Calculate estimated AFI based on classification and probabilities
  // Medical standards: Normal 8-18cm, Low <6cm, High >24cm
  const getEstimatedAFI = () => {
    if (classification === 'Normal') {
      // Weighted average: Normal range 8-18, use probabilities to estimate
      const normalProb = probabilities.Normal || probabilities.normal || 0.5;
      const lowProb = probabilities.Low || probabilities.low || 0.2;
      const highProb = probabilities.High || probabilities.high || 0.3;
      
      // Base value in normal range, adjusted by probabilities
      const baseValue = 12 + (normalProb * 6); // 12-18 range
      const adjustment = (highProb - lowProb) * 4; // Adjust based on other probabilities
      return Math.max(8, Math.min(18, baseValue + adjustment));
    } else if (classification === 'Low') {
      return 4 + (probabilities.Low || probabilities.low || 0.5) * 2; // 4-6 range
    } else {
      return 24 + (probabilities.High || probabilities.high || 0.5) * 4; // 24-28 range
    }
  };

  const estimatedAFI = getEstimatedAFI();

  // Get status configuration
  const getStatusConfig = () => {
    if (classification === 'Normal') {
      return {
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: <CheckCircle sx={{ fontSize: 64, color: 'white' }} />,
        status: 'Healthy (NORMAL AFI)',
        message: 'Everything looks good!',
        bgPattern: '#ecfdf5',
        borderColor: '#10b981'
      };
    } else if (classification === 'Low') {
      return {
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        icon: <Warning sx={{ fontSize: 64, color: 'white' }} />,
        status: 'Needs Attention (LOW AFI)',
        message: 'Follow-up recommended',
        bgPattern: '#fffbeb',
        borderColor: '#f59e0b'
      };
    } else {
      return {
        color: '#f63b3eff',
        gradient: 'linear-gradient(135deg, #f63b3eff 0%, #e61919ff 100%)',
        icon: <Error sx={{ fontSize: 64, color: 'white' }} />,
        status: 'Monitor Closely (HIGH AFI)',
        message: 'Consultation advised',
        bgPattern: '#eff6ff',
        borderColor: '#e61919ff'
      };
    }
  };

  const config = getStatusConfig();

  // Calculate position on meter (0-100%)
  const meterPosition = Math.min(100, Math.max(0, (estimatedAFI / 25) * 100));

  // Get interpretation message
  const getInterpretation = () => {
    if (classification === 'Normal') {
      return 'Your amniotic fluid level is in the healthy range, providing optimal protection and space for your baby to grow and move. This is exactly what we want to see at this stage of pregnancy.';
    } else if (classification === 'Low') {
      return 'Your amniotic fluid level is lower than typical. This may need monitoring to ensure your baby has enough cushioning and space. Your healthcare provider will guide you on next steps.';
    } else {
      return 'Your amniotic fluid level is higher than typical. While often not serious, it may warrant further evaluation to rule out any underlying causes. Follow-up with your provider is recommended.';
    }
  };

  // Get next steps
  const getNextSteps = () => {
    if (classification === 'Normal') {
      return 'Continue with your regular prenatal appointments. No additional action needed at this time. Keep up the great work with your prenatal care!';
    } else if (classification === 'Low') {
      return 'Schedule a follow-up ultrasound within the next week. Your doctor may want to check your fluid levels again and discuss hydration strategies or other interventions.';
    } else {
      return 'Book an appointment with your obstetrician within the next few days. They may recommend additional testing including glucose screening and detailed fetal anatomy assessment.';
    }
  };

  // Get optimal range for gestational week
  const getOptimalRange = () => {
    if (gestationalWeek < 20) return '8-12 cm';
    if (gestationalWeek < 28) return '10-14 cm';
    if (gestationalWeek < 36) return '12-16 cm';
    return '10-14 cm';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', p: 2 }}>
      {/* Hero Status Card */}
      <Paper
        sx={{
          background: config.gradient,
          borderRadius: 4,
          p: 4,
          mb: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)'
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {config.icon}
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {config.status}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95 }}>
                  {config.message}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.9*100, display: 'block' }}>
                  Confidence
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {(confidence * 100).toFixed(0)}%
                </Typography>
              </Box>
           
            </Box>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '6px solid rgba(255,255,255,0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {estimatedAFI.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                cm AFI
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Fluid Level Assessment */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital sx={{ color: '#3b82f6' }} />
          Fluid Level Assessment
        </Typography>
        
        {/* Visual Meter */}
        <Box
          sx={{
            position: 'relative',
            height: 80,
            borderRadius: 3,
            background: 'linear-gradient(to right, #fef3c7 0%, #d1fae5 30%, #d1fae5 70%, #fedbdbff 100%)',
            mb: 2,
            overflow: 'hidden'
          }}
        >
          {/* Markers */}
          <Box
            sx={{
              position: 'absolute',
              left: '20%',
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: '#f59e0b'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: '80%',
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: '#f63b3bff'
            }}
          />
          
          {/* Current Position Indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: `${meterPosition}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 1s ease-in-out'
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: 'white',
                border: `4px solid ${config.color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -35,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: '#1e293b',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {estimatedAFI.toFixed(1)} cm
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', px: 1 }}>
          <Typography variant="caption">0</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#f59e0b' }}>
            Low (&lt;6)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#10b981' }}>
            Normal (8-18)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#f63b48ff' }}>
            High (&gt;24)
          </Typography>
          <Typography variant="caption">25+</Typography>
        </Box>
      </Paper>

      {/* Tabbed Interface */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Details" />
          <Tab label="Guidance" />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box sx={{ space: 3 }}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {Object.entries(probabilities).map(([key, value]) => {
                  const probValue = typeof value === 'number' ? value : (value * 100);
                  const colors = {
                    Normal: { bg: '#ecfdf5', text: '#10b981', bar: '#10b981', label: 'Normal' },
                    normal: { bg: '#ecfdf5', text: '#10b981', bar: '#10b981', label: 'Normal' },
                    Low: { bg: '#fffbeb', text: '#f59e0b', bar: '#f59e0b', label: 'Low AFI' },
                    low: { bg: '#fffbeb', text: '#f59e0b', bar: '#f59e0b', label: 'Low AFI' },
                    High: { bg: '#eff6ff', text: '#f63b54ff', bar: '#e82727ff', label: 'High AFI' },
                    high: { bg: '#eff6ff', text: '#e72b2bff', bar: '#f63b3eff', label: 'High AFI' }
                  };
                  const color = colors[key] || colors.Normal;
                  
                    return (
                    <Grid item xs={12} sm={4} key={key}>
                      <Box
                      sx={{
                        bgcolor: color.bg,
                        borderRadius: 2,
                        p: 3,
                        border: `2px solid ${color.bar}20`
                      }}
                      >
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', mb: 1, display: 'block' }}>
                        {color.label}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: color.text, mb: 2 }}
                      >
                        {(probValue * 100).toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={probValue * 100}
                        sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color.bar,
                          borderRadius: 1
                        }
                        }}
                      />
                      </Box>
                    </Grid>
                    );
                })}
              </Grid>

              <Box
                sx={{
                  bgcolor: config.bgPattern,
                  border: `2px solid ${config.borderColor}40`,
                  borderRadius: 3,
                  p: 4
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Favorite sx={{ color: '#ec4899', fontSize: 28, flexShrink: 0, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5 }}>
                      What This Means
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7 }}>
                      {getInterpretation()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Details Tab */}
          {activeTab === 1 && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 3,
                      border: '2px solid #e2e8f0',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TrendingUp sx={{ color: '#6366f1', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                        Current AFI
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#6366f1', mb: 0.5 }}>
                      {estimatedAFI.toFixed(1)} cm
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Measured value
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 3,
                      border: '2px solid #e2e8f0',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Favorite sx={{ color: '#ec4899', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                        Optimal Range
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#ec4899', mb: 0.5 }}>
                      {getOptimalRange()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      For Perfect AFI Level
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper
                sx={{
                  background: 'linear-gradient(135deg, #eef2ff 0%, #f3e8ff 100%)',
                  border: '1px solid #c7d2fe',
                  borderRadius: 2,
                  p: 3
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TrendingUp sx={{ color: '#6366f1', fontSize: 24, flexShrink: 0, mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5 }}>
                      Analysis Quality
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={confidence * 100}
                          sx={{
                            height: 10,
                            borderRadius: 1,
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#6366f1',
                              borderRadius: 1
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1', minWidth: 60 }}>
                        {(confidence * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      AI model confidence in this classification
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Guidance Tab */}
          {activeTab === 2 && (
            <Box>
              <Paper
                sx={{
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)',
                  border: '1px solid #e9d5ff',
                  borderRadius: 2,
                  p: 4,
                  mb: 3
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <LocalHospital sx={{ color: '#a855f7', fontSize: 28, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5 }}>
                      Next Steps
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7, mb: 2 }}>
                      {getNextSteps()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper
                sx={{
                  border: '2px solid #fde68a',
                  bgcolor: '#fffbeb',
                  borderRadius: 2,
                  p: 3
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info sx={{ fontSize: 18 }} />
                  Important Reminder
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 3, color: '#78350f' }}>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      This AI analysis is a screening tool, not a diagnosis
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Amniotic Fluid Index should be monitored during routine ultrasounds because it helps assess the baby’s growth, safety, and overall well-being.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      If there is reduced fetal movement, abdominal pain, or leaking fluid, consult a doctor immediately—these may indicate abnormal AFI levels.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Good hydration and following the doctor’s guidance can help maintain normal AFI levels and prevent risks like low fluid or high fluid conditions.
                    </Typography>
                  </li>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Footer Note */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          color: '#94a3b8',
          mt: 3,
          mb: 2
        }}
      >
        Analysis powered by AI • Based on AIUM/SMFM guidelines
      </Typography>
      <Box component="footer" sx={{ mt: 6, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">Developed by <b>Team SPSY</b> &copy; {new Date().getFullYear()} | <a href="https://github.com/Sanjay837" target='_blank' rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Created with ❤️</a></Typography>
     </Box>
    </Box>
  );
};

export default MedicalAFIAnalysis;