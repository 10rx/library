import TenrxLogger from '../classes/TenrxLogger.js';

// Using a different naming convention for the logger. This a global variable.
// eslint-disable-next-line @typescript-eslint/naming-convention
export const TenrxLibraryLogger = new TenrxLogger({
  name: 'TenrxLibrary',
  minLevel: 'warn',
  type: 'hidden',
  maskValuesOfKeys: ['access_token', 'authorization', 'password', 'Authorization'],
  maskPlaceholder: '********',
  ignoreStackLevels: 4,
});
