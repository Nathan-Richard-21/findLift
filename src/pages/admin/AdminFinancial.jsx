import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  Pagination,
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AdminFinancial = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const limit = 20;

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/admin/all?page=${page}&limit=${limit}${statusParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.data.payments);
      setTotalPages(data.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(41, 98, 255);
    doc.text('Find Lift Financial Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString('en-ZA')}`, pageWidth / 2, 28, { align: 'center' });

    // Add statistics summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Platform Statistics', 14, 45);

    doc.setFontSize(10);
    let yPos = 55;

    if (stats) {
      const statsData = [
        ['Total Users', stats.totalUsers.toString()],
        ['Total Riders', stats.totalRiders.toString()],
        ['Total Drivers', stats.totalDrivers.toString()],
        ['', ''],
        ['Total Revenue', formatCurrency(stats.totalPaymentsReceived)],
        ['Driver Earnings', formatCurrency(stats.totalDriverEarnings)],
        ['Platform Revenue', formatCurrency(stats.totalPaymentsReceived - stats.totalDriverEarnings)],
        ['Recent Revenue (30 days)', formatCurrency(stats.recentRevenue)],
        ['', ''],
        ['Total Bookings', stats.totalBookings.toString()],
        ['Completed Bookings', stats.completedBookings.toString()],
        ['Confirmed Bookings', stats.confirmedBookings.toString()],
        ['', ''],
        ['Total Rides', stats.totalRides.toString()],
        ['Active Rides', stats.activeRides.toString()]
      ];

      doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: statsData,
        theme: 'grid',
        headStyles: { fillColor: [41, 98, 255] },
        columnStyles: {
          0: { fontStyle: 'bold' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Add payments table
    doc.setFontSize(14);
    doc.text('Recent Payments', 14, yPos);

    const paymentsData = payments.map(payment => [
      payment.payment_id || 'N/A',
      payment.rider_user_id ? `${payment.rider_user_id.first_name} ${payment.rider_user_id.last_name}` : 'N/A',
      payment.driver_user_id ? `${payment.driver_user_id.first_name} ${payment.driver_user_id.last_name}` : 'N/A',
      formatCurrency(payment.rider_payment_amount),
      formatCurrency(payment.driver_price),
      payment.status,
      formatDate(payment.createdAt)
    ]);

    doc.autoTable({
      startY: yPos + 5,
      head: [['Payment ID', 'Rider', 'Driver', 'Amount', 'Driver Earning', 'Status', 'Date']],
      body: paymentsData,
      theme: 'striped',
      headStyles: { fillColor: [41, 98, 255] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 20 },
        6: { cellWidth: 35 }
      }
    });

    // Save the PDF
    doc.save(`find-lift-financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1">
            Financial Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            View platform statistics and payment reports
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/kyc')}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToPDF}
            disabled={!stats || payments.length === 0}
          >
            Download PDF Report
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} mb={4}>
          {/* Users Statistics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalUsers}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Riders: {stats.totalRiders}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Drivers: {stats.totalDrivers}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Revenue */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(stats.totalPaymentsReceived)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Recent (30d): {formatCurrency(stats.recentRevenue)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Driver Earnings */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Driver Earnings
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(stats.totalDriverEarnings)}
                    </Typography>
                  </Box>
                  <CarIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                </Box>
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    85% of total revenue
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Platform Revenue */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Platform Revenue
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(stats.totalPaymentsReceived - stats.totalDriverEarnings)}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
                </Box>
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    15% commission
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Bookings */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Bookings
                </Typography>
                <Typography variant="h5" mb={1}>
                  {stats.totalBookings}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Completed: {stats.completedBookings}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Confirmed: {stats.confirmedBookings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Rides */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rides
                </Typography>
                <Typography variant="h5" mb={1}>
                  {stats.totalRides}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Active: {stats.activeRides}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payments Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Payment History
            </Typography>
            <ButtonGroup size="small">
              <Button
                variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => {
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
                onClick={() => {
                  setStatusFilter('completed');
                  setPage(1);
                }}
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === 'processing' ? 'contained' : 'outlined'}
                onClick={() => {
                  setStatusFilter('processing');
                  setPage(1);
                }}
              >
                Processing
              </Button>
              <Button
                variant={statusFilter === 'failed' ? 'contained' : 'outlined'}
                onClick={() => {
                  setStatusFilter('failed');
                  setPage(1);
                }}
              >
                Failed
              </Button>
            </ButtonGroup>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Payment ID</TableCell>
                      <TableCell>Rider</TableCell>
                      <TableCell>Driver</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Driver Earning</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment._id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {payment.payment_id ? payment.payment_id.substring(0, 20) + '...' : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {payment.rider_user_id ? (
                              <Box>
                                <Typography variant="body2">
                                  {payment.rider_user_id.first_name} {payment.rider_user_id.last_name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {payment.rider_user_id.email}
                                </Typography>
                              </Box>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {payment.driver_user_id ? (
                              <Box>
                                <Typography variant="body2">
                                  {payment.driver_user_id.first_name} {payment.driver_user_id.last_name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {payment.driver_user_id.email}
                                </Typography>
                              </Box>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(payment.rider_payment_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main">
                              {formatCurrency(payment.driver_price)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payment.status}
                              color={getStatusColor(payment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(payment.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Stack spacing={2} alignItems="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Stack>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminFinancial;
