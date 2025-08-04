# Collaro Customer Dashboard

A customer management dashboard built with Next.js, React, and Material-UI. The backend is powered by Express and serves mock data for demonstration. The dashboard allows you to view customers, inspect their orders, and update details directly from the interface.

## Features

- View customers in a sortable, paginated table
- Expand customer rows to display related orders
- Edit customer status and order item sizes inline
- Instant updates without reloading the page
- Mobile-friendly responsive layout

## Getting Started

**Prerequisites:**  
- Node.js (v16 or higher)

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd collaro-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```
- Starts the Express API server on port 3001
- Uses Faker.js to generate mock customer and order data

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
- Runs the Next.js app on port 3000
- Access the dashboard at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
collaro-dashboard/
├── backend/
│   ├── data/           # Mock data generators
│   ├── routes/         # API endpoints
│   ├── server.js       # Express server entry
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── components/ # UI components
│   │   ├── lib/        # Utility functions and API calls
│   │   ├── page.js     # Main dashboard page
│   │   └── theme.js    # Material-UI theme setup
│   └── package.json
└── README.md
```

## Main Components

- **CustomerTable**: Displays customers with sorting and pagination
- **CustomerRow**: Expandable rows to show orders
- **OrdersTable**: Shows orders for selected customers
- **InlineSizeEditor**: Edit order item sizes directly
- **InlineStatusEditor**: Update customer status inline

## API Overview

- `GET /api/customers`  
  Returns a paginated, sortable list of customers

- `GET /api/customers/:id/orders`  
  Fetches orders for a specific customer

Supports query parameters for pagination (`page`, `limit`) and sorting (`sortBy`, `order`).

## Troubleshooting

- **Port in use:** If ports 3000 or 3001 are busy, you'll be prompted to use another port.
- **CORS errors:** Ensure the backend is running before starting the frontend.
- **Install issues:** Try `npm cache clean --force`, remove `node_modules`, and reinstall.
- **Missing modules:** Confirm you are in the correct directory when running commands.

## Tech Stack

**Frontend:**  
- Next.js  
- React  
- Material-UI  
- Emotion (CSS-in-JS)

**Backend:**  
- Express.js  
- CORS  
- Faker.js  
- date-fns

## Implementation Notes

This dashboard demonstrates multi-level data handling, expandable tables, inline editing, and real-time UI updates. The most challenging aspect was managing nested state for inline editing while keeping the interface responsive and intuitive.
