require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateMockData } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Generate mock data once when server starts
const { customers, customerMap } = generateMockData(100);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// Helper function to filter customers based on search query
const filterCustomers = (customers, search) => {
  if (!search) return customers;
  
  const searchLower = search.toLowerCase();
  return customers.filter(customer => 
    customer.name.toLowerCase().includes(searchLower) ||
    customer.email.toLowerCase().includes(searchLower)
  );
};

// Helper function to sort customers
const sortCustomers = (customers, sortBy, order) => {
  if (!sortBy) return customers;
  
  return [...customers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle different data types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    // Handle null values (for lastOrderDate)
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return order === 'asc' ? 1 : -1;
    if (bValue === null) return order === 'asc' ? -1 : 1;
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Helper function to paginate results
const paginateResults = (items, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return items.slice(startIndex, endIndex);
};

// API Routes

// GET /api/customers - Get customers with pagination, sorting, and filtering
app.get('/api/customers', (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      order = 'asc',
      search = ''
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        error: 'Page and limit must be positive integers'
      });
    }

    // Filter customers based on search
    let filteredCustomers = filterCustomers(customers, search);

    // Sort customers
    const sortedCustomers = sortCustomers(filteredCustomers, sortBy, order);

    // Calculate total count for pagination
    const totalCount = sortedCustomers.length;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Paginate results
    const paginatedCustomers = paginateResults(sortedCustomers, pageNum, limitNum);

    // Remove orders from customer objects (as per requirements)
    const customersWithoutOrders = paginatedCustomers.map(customer => {
      const { orders, ...customerWithoutOrders } = customer;
      return customerWithoutOrders;
    });

    res.json({
      customers: customersWithoutOrders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/customers/:id/orders - Get orders for a specific customer
app.get('/api/customers/:id/orders', (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = customerMap.get(id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Return the orders array with all nested details
    const orders = customer.orders || [];
    
    res.json({
      customerId: id,
      customerName: customer.name,
      orders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    totalCustomers: customers.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Generated ${customers.length} mock customers`);
  console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);
});

module.exports = app;