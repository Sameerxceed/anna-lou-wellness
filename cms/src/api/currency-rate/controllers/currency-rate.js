'use strict';
const { createCoreController } = require('@strapi/strapi').factories;
module.exports = createCoreController('api::currency-rate.currency-rate');
