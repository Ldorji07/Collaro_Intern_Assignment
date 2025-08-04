# Design Choices & What I Learned

## State Management - Keeping It Simple

I went with local React state using `useState` hooks instead of Redux or Context API. For this dashboard, heavy state management felt like overkill.

**Main table state in `CustomerDashboard.jsx`:**
```jsx
const [customers, setCustomers] = useState([]);
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [orderBy, setOrderBy] = useState('name');
const [order, setOrder] = useState('asc');
const [totalCount, setTotalCount] = useState(0);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```
Why this approach?
- Simple to debug: All state is in the component
- Fast to implement: No boilerplate, just useState and go
- Good enough performance: React is smart about re-renders
- Auto-syncs with backend: useEffect dependencies handle server calls

**Individual row state:**
```jsx
const [expandedRows, setExpandedRows] = useState({});
const [editingCustomer, setEditingCustomer] = useState({ customerId: null, field: null, value: null });
const [editingOrderItem, setEditingOrderItem] = useState({ orderId: null, orderItemId: null, customSize: null });
```
Each expanded row manages its own loading, error, and order data. This keeps things isolated—expanding one row doesn't affect others, and orders only load when needed.

## API Design - Split It Up

I split the API into two endpoints:

- **Customer list:** `GET /api/customers`
  - Just customer info, with pagination and sorting
  - No nested order data (keeps it fast)
- **Customer orders:** `GET /api/customers/:id/orders`
  - Loads order details only when a row is expanded

This keeps the initial page load snappy and avoids loading unnecessary data. Lazy loading order details is much more scalable.

**Benefits:**
- Way faster initial load
- Less memory usage (collapsed rows don't hold order data)
- Easier to cache different types of data separately
- Backend can optimize each endpoint differently

## The Biggest Challenge - Nested Inline Editing

The trickiest part was handling editing at multiple levels:
- Customer status editing
- Order item size editing (nested inside expanded rows)

**State hierarchy:**
```
CustomerDashboard → ExpandedRow → InlineSizeEditor
```

**How I solved it:**
Each editing component manages its own state:
```jsx
const [editing, setEditing] = useState(false);
const [size, setSize] = useState(item.customSize);
```
Key decisions:
- Optimistic updates: UI updates immediately, API call happens in background
- Cancel restores original values if needed
- Input validation prevents invalid sizes
- Independent state: Each editor doesn't know or care about others

The hardest part was keeping data flow isolated so editing one item didn't affect others.

## What I'd Do Differently

If I had more time, I'd implement proper state management (React Context + useReducer):

```jsx
const CustomerContext = createContext();
const customerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CUSTOMERS':
    case 'UPDATE_FILTERS':
    case 'TOGGLE_ROW_EXPANSION':
    case 'UPDATE_CUSTOMER_STATUS':
    case 'UPDATE_ORDER_ITEM_SIZE':
    // ...other actions
  }
};
```
Why?
- Predictable state changes
- Easier debugging (Redux DevTools)
- Better for teams
- Undo/redo support
- Bulk operations

Migration strategy:
- Add context alongside local state
- Move components over gradually
- Add advanced features (undo, bulk edit)
- Clean up old state

---

## Q&A

### 1. How did you manage the application's state, particularly the complex state for the main table (filters, sorting) and the individual row states (expanded, loading, editing)?

I used local React state via `useState` for all aspects of the dashboard. The main table's state (filters, sorting, pagination, loading, error) is managed at the top level of `CustomerDashboard.jsx`. Each row's expanded/collapsed state, loading/error for orders, and editing states for customer status and order item sizes are tracked in separate state objects (`expandedRows`, `editingCustomer`, `editingOrderItem`). This keeps state isolated and easy to reason about, with updates handled via callbacks and optimistic UI updates.

### 2. Explain your API design. Why did you choose to separate the customer and order endpoints? What are the benefits of this approach?

The API is split into two endpoints:
- `GET /api/customers`: Returns paginated, filtered, and sorted customer data without nested orders.
- `GET /api/customers/:id/orders`: Returns detailed order data for a specific customer.

This separation allows the frontend to load only essential customer data initially, keeping the dashboard fast and responsive. Order details are fetched only when a row is expanded, reducing unnecessary data transfer and memory usage. It also makes backend logic simpler and endpoints easier to cache and optimize independently.

### 3. Describe the biggest technical challenge you faced while implementing the nested inline editing feature and how you solved it.

The hardest part was managing editing state for nested order items inside expanded rows, while also supporting customer status editing at the table level. I solved this by keeping editing state for each feature separate (`editingCustomer` for status, `editingOrderItem` for sizes) and updating local state optimistically. Each editor is isolated, so editing one item doesn't affect others. Cancel actions restore original values, and updates are reflected immediately in the UI.

### 4. If you had another day, what single feature or refactor would you prioritize and why?

I would refactor state management to use React Context and a reducer (like `useReducer` or Redux). This would centralize state updates, make debugging easier, and support advanced features like undo/redo or bulk editing. It would also improve maintainability and scalability for future development.
