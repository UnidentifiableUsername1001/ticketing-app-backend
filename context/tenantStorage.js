import { AsyncLocalStorage } from 'node:async_hooks';

const tenantStorage = new AsyncLocalStorage();

export {
    tenantStorage
}