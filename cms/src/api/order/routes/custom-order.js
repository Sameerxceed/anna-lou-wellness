'use strict';

module.exports = {
  routes: [
    // Dashboard — GET /api/orders/dashboard
    {
      method: 'GET',
      path: '/orders/dashboard',
      handler: 'order.dashboard',
      config: { policies: [] },
    },
    // Export CSV — GET /api/orders/export
    {
      method: 'GET',
      path: '/orders/export',
      handler: 'order.exportCsv',
      config: { policies: [] },
    },
    // Update status — PUT /api/orders/:id/status
    {
      method: 'PUT',
      path: '/orders/:id/status',
      handler: 'order.updateStatus',
      config: { policies: [] },
    },
  ],
};
