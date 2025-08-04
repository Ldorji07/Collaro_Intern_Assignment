'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
  Save,
  Cancel,
  Search,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { customerApi } from '../services/api';

const CustomerDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Sorting state
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState({});
  
  // Editing states
  const [editingCustomer, setEditingCustomer] = useState({
    customerId: null,
    field: null,
    value: null,
  });
  
  const [editingOrderItem, setEditingOrderItem] = useState({
    orderId: null,
    orderItemId: null,
    customSize: null,
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        sortBy: orderBy,
        order,
        search: searchTerm,
      };
      
      const response = await customerApi.getCustomers(params);
      setCustomers(response.customers);
      setTotalCount(response.pagination.totalCount);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, orderBy, order, searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset to first page when sorting
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(0); // Reset to first page when searching
  };

  const handleExpandRow = async (customerId) => {
    const currentState = expandedRows[customerId];
    
    if (currentState?.isOpen) {
      // Close the row
      setExpandedRows(prev => ({
        ...prev,
        [customerId]: { ...prev[customerId], isOpen: false },
      }));
      return;
    }

    // Open the row
    setExpandedRows(prev => ({
      ...prev,
      [customerId]: {
        isOpen: true,
        orders: currentState?.orders || null,
        loading: !currentState?.orders,
        error: null,
      },
    }));

    // Fetch orders if not already loaded
    if (!currentState?.orders) {
      try {
        const response = await customerApi.getCustomerOrders(customerId);
        setExpandedRows(prev => ({
          ...prev,
          [customerId]: {
            ...prev[customerId],
            orders: response.orders,
            loading: false,
          },
        }));
      } catch (err) {
        setExpandedRows(prev => ({
          ...prev,
          [customerId]: {
            ...prev[customerId],
            loading: false,
            error: 'Failed to load orders',
          },
        }));
      }
    }
  };

  const handleEditCustomerStatus = (customerId, currentStatus) => {
    setEditingCustomer({
      customerId,
      field: 'status',
      value: currentStatus,
    });
  };

  const handleSaveCustomerStatus = () => {
    if (editingCustomer.customerId && editingCustomer.value) {
      console.log('Saving customer status:', {
        customerId: editingCustomer.customerId,
        newStatus: editingCustomer.value,
      });
      
      // Update local state
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === editingCustomer.customerId
            ? { ...customer, status: editingCustomer.value }
            : customer
        )
      );
    }
    setEditingCustomer({ customerId: null, field: null, value: null });
  };

  const handleCancelCustomerEdit = () => {
    setEditingCustomer({ customerId: null, field: null, value: null });
  };

  const handleEditOrderItemSize = (orderId, orderItemId, customSize) => {
    setEditingOrderItem({
      orderId,
      orderItemId,
      customSize: { ...customSize },
    });
  };

  const handleSaveOrderItemSize = () => {
    if (editingOrderItem.orderId && editingOrderItem.orderItemId && editingOrderItem.customSize) {
      console.log('Saving order item size:', {
        orderId: editingOrderItem.orderId,
        orderItemId: editingOrderItem.orderItemId,
        newSize: editingOrderItem.customSize,
      });
      
      // Update local state
      setExpandedRows(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(customerId => {
          if (newState[customerId].orders) {
            newState[customerId].orders = newState[customerId].orders.map(order =>
              order.orderId === editingOrderItem.orderId
                ? {
                    ...order,
                    items: order.items.map(item =>
                      item.orderItemId === editingOrderItem.orderItemId
                        ? { ...item, customSize: editingOrderItem.customSize }
                        : item
                    ),
                  }
                : order
            );
          }
        });
        return newState;
      });
    }
    setEditingOrderItem({ orderId: null, orderItemId: null, customSize: null });
  };

  const handleCancelOrderItemEdit = () => {
    setEditingOrderItem({ orderId: null, orderItemId: null, customSize: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'churned':
        return 'error';
      case 'prospect':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading && customers.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Customer Dashboard
          </Typography>
          
          {/* Search Bar */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Search customers"
              variant="outlined"
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ minWidth: 300 }}
            />
            <IconButton onClick={handleSearch} color="primary">
              <Search />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'orderCount'}
                      direction={orderBy === 'orderCount' ? order : 'asc'}
                      onClick={() => handleRequestSort('orderCount')}
                    >
                      Order Count
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'revenue'}
                      direction={orderBy === 'revenue' ? order : 'asc'}
                      onClick={() => handleRequestSort('revenue')}
                    >
                      Total Revenue
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <React.Fragment key={customer.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleExpandRow(customer.id)}
                        >
                          {expandedRows[customer.id]?.isOpen ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>
                        {editingCustomer.customerId === customer.id &&
                        editingCustomer.field === 'status' ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={editingCustomer.value}
                                onChange={(e) =>
                                  setEditingCustomer(prev => ({
                                    ...prev,
                                    value: e.target.value,
                                  }))
                                }
                              >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="churned">Churned</MenuItem>
                                <MenuItem value="prospect">Prospect</MenuItem>
                              </Select>
                            </FormControl>
                            <IconButton
                              size="small"
                              onClick={handleSaveCustomerStatus}
                              color="primary"
                            >
                              <Save />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelCustomerEdit}
                            >
                              <Cancel />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Chip
                            label={customer.status}
                            color={getStatusColor(customer.status)}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell align="right">{customer.orderCount}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(customer.revenue)}
                      </TableCell>
                      <TableCell>
                        {editingCustomer.customerId !== customer.id && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEditCustomerStatus(customer.id, customer.status)
                            }
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row Content */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse
                          in={expandedRows[customer.id]?.isOpen}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Orders for {customer.name}
                            </Typography>
                            
                            {expandedRows[customer.id]?.loading && (
                              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress />
                              </Box>
                            )}
                            
                            {expandedRows[customer.id]?.error && (
                              <Alert severity="error" sx={{ mb: 2 }}>
                                {expandedRows[customer.id]?.error}
                              </Alert>
                            )}
                            
                            {expandedRows[customer.id]?.orders && (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Order Date</TableCell>
                                    <TableCell align="right">Total Amount</TableCell>
                                    <TableCell>Items</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {expandedRows[customer.id]?.orders?.map((order) => (
                                    <TableRow key={order.orderId}>
                                      <TableCell>{order.orderId.slice(0, 8)}...</TableCell>
                                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                                      <TableCell align="right">
                                        {formatCurrency(order.totalAmount)}
                                      </TableCell>
                                      <TableCell>
                                        <Stack spacing={1}>
                                          {order.items.map((item) => (
                                            <Box key={item.orderItemId}>
                                              <Typography variant="body2" fontWeight="medium">
                                                {item.itemName} - {formatCurrency(item.price)}
                                              </Typography>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {editingOrderItem.orderItemId === item.orderItemId ? (
                                                  <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="caption">Size:</Typography>
                                                    <TextField
                                                      size="small"
                                                      label="C"
                                                      type="number"
                                                      value={editingOrderItem.customSize?.chest || ''}
                                                      onChange={(e) =>
                                                        setEditingOrderItem(prev => ({
                                                          ...prev,
                                                          customSize: {
                                                            ...prev.customSize,
                                                            chest: parseInt(e.target.value) || 0,
                                                          },
                                                        }))
                                                      }
                                                      sx={{ width: 60 }}
                                                    />
                                                    <TextField
                                                      size="small"
                                                      label="W"
                                                      type="number"
                                                      value={editingOrderItem.customSize?.waist || ''}
                                                      onChange={(e) =>
                                                        setEditingOrderItem(prev => ({
                                                          ...prev,
                                                          customSize: {
                                                            ...prev.customSize,
                                                            waist: parseInt(e.target.value) || 0,
                                                          },
                                                        }))
                                                      }
                                                      sx={{ width: 60 }}
                                                    />
                                                    <TextField
                                                      size="small"
                                                      label="H"
                                                      type="number"
                                                      value={editingOrderItem.customSize?.hips || ''}
                                                      onChange={(e) =>
                                                        setEditingOrderItem(prev => ({
                                                          ...prev,
                                                          customSize: {
                                                            ...prev.customSize,
                                                            hips: parseInt(e.target.value) || 0,
                                                          },
                                                        }))
                                                      }
                                                      sx={{ width: 60 }}
                                                    />
                                                    <IconButton
                                                      size="small"
                                                      onClick={handleSaveOrderItemSize}
                                                      color="primary"
                                                    >
                                                      <Save />
                                                    </IconButton>
                                                    <IconButton
                                                      size="small"
                                                      onClick={handleCancelOrderItemEdit}
                                                    >
                                                      <Cancel />
                                                    </IconButton>
                                                  </Stack>
                                                ) : (
                                                  <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="caption">
                                                      Size (C/W/H): {item.customSize.chest}/{item.customSize.waist}/{item.customSize.hips}
                                                    </Typography>
                                                    <IconButton
                                                      size="small"
                                                      onClick={() =>
                                                        handleEditOrderItemSize(
                                                          order.orderId,
                                                          item.orderItemId,
                                                          item.customSize
                                                        )
                                                      }
                                                    >
                                                      <Edit />
                                                    </IconButton>
                                                  </Stack>
                                                )}
                                              </Box>
                                            </Box>
                                          ))}
                                        </Stack>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default CustomerDashboard;