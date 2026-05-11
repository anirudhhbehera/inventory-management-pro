import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Divider, useMediaQuery, useTheme
} from '@mui/material';
import { Psychology, TrendingUp, Warning, AttachMoney, Refresh } from '@mui/icons-material';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

function GeminiInsights() {
  const [insights, setInsights] = useState({});
  const [customerBehavior, setCustomerBehavior] = useState({});
  const [supplierRecs, setSupplierRecs] = useState({});
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const loadGeminiInsights = async () => {
    setLoading(true);
    const toastId = toast.loading('Fetching AI insights...');
    try {
      const [insightsRes, behaviorRes, supplierRes] = await Promise.all([
        aiAPI.getGeminiInsights(),
        aiAPI.getCustomerBehavior(),
        aiAPI.getSupplierRecommendations()
      ]);
      setInsights(insightsRes.data);
      setCustomerBehavior(behaviorRes.data);
      setSupplierRecs(supplierRes.data);
      toast.success('Insights updated!', { id: toastId });
    } catch (error) {
      toast.error('Failed to load insights', { id: toastId });
      if (error.response?.status !== 401) {
        setInsights({
          recommendations: ['Unable to load insights'],
          trends: 'Please try again',
          alerts: 'Service temporarily unavailable',
          revenue_tips: 'Check connection'
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadGeminiInsights(); }, []);

  const InsightBlock = ({ label, value }) => (
    <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1.5 }}>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="white">{value || '—'}</Typography>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', sm: '2rem' } }}>
          🤖 Gemini AI Insights
        </Typography>
        <Button
          variant="contained" onClick={loadGeminiInsights} disabled={loading}
          startIcon={loading ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Psychology />}
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </Button>
      </Box>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <Grid container spacing={3}>
        {/* AI Recommendations */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  🚀 AI Recommendations
                </Typography>
              </Box>
              {insights.recommendations?.map((rec, index) => (
                <Box key={index} sx={{ mb: 1, p: 1.5, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1.5 }}>
                  <Typography variant="body2" color="white">• {rec}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Typography variant="body2" color="white">
                <strong>📈 Market Trends:</strong> {insights.trends}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Smart Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  ⚡ Smart Alerts
                </Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1.5, mb: 2 }}>
                <Typography variant="body1" color="white">{insights.alerts}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1.5 }}>
                <AttachMoney sx={{ mr: 1, mt: 0.2, flexShrink: 0 }} />
                <Typography variant="body2" color="white">
                  <strong>💰 Revenue Insights:</strong> {insights.revenue_tips}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Intelligence */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                👥 Customer Intelligence
              </Typography>
              <InsightBlock label="🔄 Purchase Patterns" value={customerBehavior.patterns} />
              <InsightBlock label="🎯 Customer Segments" value={customerBehavior.segments} />
              <InsightBlock label="📢 Marketing Strategy" value={customerBehavior.marketing} />
            </CardContent>
          </Card>
        </Grid>

        {/* Supplier Intelligence */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                🏭 Supplier Intelligence
              </Typography>
              <InsightBlock label="⚡ Performance Boost" value={supplierRecs.improvements} />
              <InsightBlock label="🎯 Strategic Requirements" value={supplierRecs.requirements} />
              <InsightBlock label="💡 Cost Optimization" value={supplierRecs.cost_optimization} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default GeminiInsights;
