import { partnerProducts } from './partnerProducts';
import { partnerReviews } from './platform';
import { products as companyProducts } from './products';
import { reviews as companyReviews } from './reviews';

export { accessEvents } from './accessEvents';
export { accounts, testCompanyAccount, testMasterAccount } from './accounts';
export { mockNow, mockToday } from './clock';
export { coinSettings, defaultCoinSettings } from './coins';
export { companies } from './companies';
export { couponOffers } from './coupons';
export { couponTemplate, integrationSettings } from './integrations';
export { customers } from './platform';
export { redemptions } from './redemptions';
export { tagById, tags } from './tags';

export const products = [...companyProducts, ...partnerProducts];
export const reviews = [...companyReviews, ...partnerReviews];
