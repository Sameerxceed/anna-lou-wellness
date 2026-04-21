'use strict';
const { createCoreService } = require('@strapi/strapi').factories;
module.exports = createCoreService('api::site-settings.site-settings');
