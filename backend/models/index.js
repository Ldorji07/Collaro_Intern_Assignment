const { faker } = require('@faker-js/faker');
const { format, subDays, subMonths } = require('date-fns');

// Data models as per assignment requirements

class CustomSize {
  constructor(chest, waist, hips) {
    this.chest = chest;
    this.waist = waist;
    this.hips = hips;
  }
}

class OrderItem {
  constructor(orderItemId, itemName, category, price, customSize) {
    this.orderItemId = orderItemId;
    this.itemName = itemName;
    this.category = category;
    this.price = price;
    this.customSize = customSize;
  }
}

class Order {
  constructor(orderId, orderDate, items) {
    this.orderId = orderId;
    this.orderDate = orderDate;
    this.items = items;
    this.totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  }
}

class Customer {
  constructor(id, name, email, status, createdAt, orders = []) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.status = status;
    this.createdAt = createdAt;
    this.orders = orders; // Store orders array
    this.revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    this.orderCount = orders.length;
    this.lastOrderDate = orders.length > 0
      ? orders.reduce((latest, order) =>
          new Date(order.orderDate) > new Date(latest) ? order.orderDate : latest,
          orders[0].orderDate
        )
      : null;
  }
}

// Mock data generation functions
const generateCustomSize = () => {
  return new CustomSize(
    faker.number.int({ min: 32, max: 48 }), // chest
    faker.number.int({ min: 28, max: 42 }), // waist
    faker.number.int({ min: 34, max: 46 })  // hips
  );
};

const generateOrderItem = () => {
  const categories = ['Jackets', 'Trousers', 'Dresses', 'Shirts', 'Blazers', 'Coats'];
  const itemNames = {
    'Jackets': ['Bespoke Wool Jacket', 'Custom Leather Jacket', 'Tailored Dinner Jacket'],
    'Trousers': ['Bespoke Wool Trousers', 'Custom Linen Trousers', 'Tailored Dress Pants'],
    'Dresses': ['Custom Evening Dress', 'Bespoke Cocktail Dress', 'Tailored Day Dress'],
    'Shirts': ['Bespoke Cotton Shirt', 'Custom Silk Shirt', 'Tailored Dress Shirt'],
    'Blazers': ['Bespoke Linen Blazer', 'Custom Wool Blazer', 'Tailored Sport Coat'],
    'Coats': ['Bespoke Overcoat', 'Custom Trench Coat', 'Tailored Winter Coat']
  };

  const category = faker.helpers.arrayElement(categories);
  const itemName = faker.helpers.arrayElement(itemNames[category]);
  
  return new OrderItem(
    faker.string.uuid(),
    itemName,
    category,
    faker.number.int({ min: 200, max: 800 }),
    generateCustomSize()
  );
};

const generateOrder = () => {
  const itemCount = faker.number.int({ min: 1, max: 4 });
  const items = Array.from({ length: itemCount }, () => generateOrderItem());
  
  return new Order(
    faker.string.uuid(),
    faker.date.between({ 
      from: subMonths(new Date(), 24), 
      to: new Date() 
    }).toISOString(),
    items
  );
};

const generateCustomer = () => {
  const statuses = ['active', 'churned', 'prospect'];
  const orderCount = faker.number.int({ min: 0, max: 8 });
  const orders = Array.from({ length: orderCount }, () => generateOrder());
  
  return new Customer(
    faker.string.uuid(),
    faker.person.fullName(),
    faker.internet.email(),
    faker.helpers.arrayElement(statuses),
    faker.date.between({ 
      from: subMonths(new Date(), 36), 
      to: subMonths(new Date(), 1) 
    }).toISOString(),
    orders
  );
};

// Generate mock data
const generateMockData = (customerCount = 100) => {
  const customers = Array.from({ length: customerCount }, () => generateCustomer());
  
  // Create a map for quick customer lookup
  const customerMap = new Map();
  customers.forEach(customer => {
    customerMap.set(customer.id, customer);
  });
  
  return {
    customers,
    customerMap
  };
};

module.exports = {
  CustomSize,
  OrderItem,
  Order,
  Customer,
  generateMockData
};