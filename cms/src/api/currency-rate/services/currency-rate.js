'use strict';
const { createCoreService } = require('@strapi/strapi').factories;
module.exports = createCoreService('api::currency-rate.currency-rate');
