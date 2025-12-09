import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDollarSign, FaUsers, FaCar, FaChartLine, FaDownload, FaArrowLeft, FaSpinner, FaWallet } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import api from '../../services/api';

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
      const response = await api.get('/payments/admin/stats');
      setStats(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await api.get(`/payments/admin/all?page=${page}&limit=${limit}${statusParam}`);
      
      setPayments(response.data.data.payments);
      setTotalPages(response.data.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
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

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const exportToPDF = () => {
    if (!stats) {
      alert('No statistics available to export');
      return;
    }

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

    const statsData = [
      ['Total Users', (stats.users?.total || 0).toString()],
      ['Total Riders', (stats.users?.riders || 0).toString()],
      ['Total Drivers', (stats.users?.drivers || 0).toString()],
      ['', ''],
      ['Total Revenue', formatCurrency(stats.payments?.totalRevenue || 0)],
      ['Driver Earnings', formatCurrency(stats.payments?.totalDriverEarnings || 0)],
      ['Platform Revenue', formatCurrency((stats.payments?.totalRevenue || 0) - (stats.payments?.totalDriverEarnings || 0))],
      ['Recent Revenue (30 days)', formatCurrency(stats.payments?.recentRevenue || 0)],
      ['', ''],
      ['Total Bookings', (stats.bookings?.total || 0).toString()],
      ['Completed Bookings', (stats.bookings?.completed || 0).toString()],
      ['Confirmed Bookings', (stats.bookings?.confirmed || 0).toString()],
      ['', ''],
      ['Total Rides', (stats.rides?.total || 0).toString()],
      ['Active Rides', (stats.rides?.active || 0).toString()]
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

    // Add payments table
    doc.setFontSize(14);
    doc.text('Recent Payments', 14, yPos);

    const paymentsData = payments.map(payment => [
      payment.payment_id ? payment.payment_id.substring(0, 25) : 'N/A',
      payment.rider_user_id ? `${payment.rider_user_id.first_name} ${payment.rider_user_id.last_name}` : 'N/A',
      payment.driver_user_id ? `${payment.driver_user_id.first_name} ${payment.driver_user_id.last_name}` : 'N/A',
      formatCurrency(payment.rider_payment_amount || 0),
      formatCurrency(payment.driver_price || 0),
      payment.status || 'N/A',
      payment.createdAt ? formatDate(payment.createdAt) : 'N/A'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaDollarSign className="mr-3 text-green-600" />
                Financial Dashboard
              </h1>
              <p className="text-gray-600 mt-1">View platform statistics and payment reports</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/kyc')}
                className="btn-secondary flex items-center gap-2"
              >
                <FaArrowLeft />
                Back to Dashboard
              </button>
              <button
                onClick={exportToPDF}
                disabled={!stats || payments.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.users?.total || 0}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">Riders: {stats.users?.riders || 0}</p>
                    <p className="text-xs text-gray-500">Drivers: {stats.users?.drivers || 0}</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaUsers className="text-3xl text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.payments?.totalRevenue || 0)}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Recent (30d): {formatCurrency(stats.payments?.recentRevenue || 0)}</p>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaDollarSign className="text-3xl text-green-600" />
                </div>
              </div>
            </div>

            {/* Driver Earnings */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Driver Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.payments?.totalDriverEarnings || 0)}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">85% of total revenue</p>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaCar className="text-3xl text-purple-600" />
                </div>
              </div>
            </div>

            {/* Platform Revenue */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Platform Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency((stats.payments?.totalRevenue || 0) - (stats.payments?.totalDriverEarnings || 0))}
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">15% commission</p>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaWallet className="text-3xl text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Bookings Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stats.bookings?.total || 0}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Completed: {stats.bookings?.completed || 0}</p>
                    <p className="text-xs text-gray-500">Confirmed: {stats.bookings?.confirmed || 0}</p>
                  </div>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FaChartLine className="text-3xl text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Rides Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Rides</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stats.rides?.total || 0}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Active: {stats.rides?.active || 0}</p>
                  </div>
                </div>
                <div className="p-3 bg-pink-100 rounded-lg">
                  <FaCar className="text-3xl text-pink-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setStatusFilter('all'); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    statusFilter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { setStatusFilter('completed'); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    statusFilter === 'completed' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => { setStatusFilter('processing'); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    statusFilter === 'processing' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Processing
                </button>
                <button
                  onClick={() => { setStatusFilter('failed'); setPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    statusFilter === 'failed' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Failed
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-3xl text-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Rider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Driver Earning
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          No payments found
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-900">
                              {payment.payment_id ? payment.payment_id.substring(0, 20) + '...' : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {payment.rider_user_id ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.rider_user_id.first_name} {payment.rider_user_id.last_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.rider_user_id.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {payment.driver_user_id ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.driver_user_id.first_name} {payment.driver_user_id.last_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.driver_user_id.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(payment.rider_payment_amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(payment.driver_price)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {formatDate(payment.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinancial;
