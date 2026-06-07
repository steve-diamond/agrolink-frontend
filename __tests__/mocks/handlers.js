/**
 * __tests__/mocks/handlers.js
 * Default MSW request handlers. Override per-test with server.use().
 */
const { rest } = require('msw');

const mockOrders = [
  { _id: 'order-1', status: 'pending', totalAmount: 25000, createdAt: '2024-01-15T10:00:00Z', paymentStatus: 'unpaid' },
  { _id: 'order-2', status: 'delivered', totalAmount: 48000, createdAt: '2024-01-10T08:00:00Z', paymentStatus: 'paid' },
];

const mockLoans = [
  { _id: 'loan-1', amount: 100000, status: 'active', dueDate: '2024-06-01T00:00:00Z', repaidAmount: 20000 },
];

const mockShipments = [
  { _id: 'shipment-1', status: 'in-transit', origin: 'Lagos', destination: 'Abuja', estimatedArrival: '2024-01-20T00:00:00Z' },
];

const mockStorage = [
  { _id: 'storage-1', warehouseName: 'Lagos Central', quantity: 500, unit: 'bags', commodity: 'Maize' },
];

const mockFarmingTips = [
  { title: 'Irrigation', content: 'Water your crops early in the morning.' },
  { title: 'Soil Health', content: 'Rotate crops to maintain soil fertility.' },
];

const handlers = [
  rest.get('*/api/orders', (req, res, ctx) => res(ctx.status(200), ctx.json(mockOrders))),
  rest.get('*/api/loans*', (req, res, ctx) => res(ctx.status(200), ctx.json(mockLoans))),
  rest.get('*/api/logistics/shipments*', (req, res, ctx) => res(ctx.status(200), ctx.json(mockShipments))),
  rest.get('*/api/warehouse/storage*', (req, res, ctx) => res(ctx.status(200), ctx.json(mockStorage))),
  rest.get('*/api/farming-tips*', (req, res, ctx) => res(ctx.status(200), ctx.json(mockFarmingTips))),
  rest.get('*/api/products*', (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json([
        {
          _id: 'product-1',
          name: 'Premium Maize',
          price: 15000,
          unit: 'per bag',
          location: 'Kaduna',
          seller: { id: 'seller-1', name: 'Aminu Farms', rating: 4.5 },
        },
      ])
    )
  ),
];

module.exports = { handlers, mockOrders, mockLoans, mockShipments, mockStorage, mockFarmingTips };
