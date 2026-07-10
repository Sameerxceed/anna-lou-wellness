'use strict';

/**
 * Contact singleton lifecycle — revalidates /contact when Anna edits
 * anything (contact info, address, Discovery Call fields, upsells).
 */

const { notifyRevalidate } = require('../../../../utils/revalidate');

module.exports = {
  async afterCreate() {
    await notifyRevalidate(strapi, ['/', '/contact']);
  },
  async afterUpdate() {
    await notifyRevalidate(strapi, ['/', '/contact']);
  },
};
