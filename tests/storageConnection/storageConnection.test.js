
/* globals expect, jest, it,  describe,  beforeEach */

describe('Storage Connection Module', () => {
  let initializeStorageConnection;
  let getStorageConnection;

  beforeEach(() => {
    // Reset the modules to ensure a clean state for each test
    jest.resetModules();
    const storageModule = require('../../lib/main/server/storageConnection');
    initializeStorageConnection = storageModule.initializeStorageConnection;
    getStorageConnection = storageModule.getStorageConnection;
  });

  it('should initialize the storage connection successfully', () => {
    const mockStorage = { storageType: 'mock' };

    const result = initializeStorageConnection(mockStorage);

    expect(result).toBe(mockStorage);
  });

  it('should not reinitialize the storage connection if it is already set', () => {
    const mockStorage1 = { storageType: 'mock1' };
    const mockStorage2 = { storageType: 'mock2' };

    initializeStorageConnection(mockStorage1);
    const result = initializeStorageConnection(mockStorage2);

    expect(result).toBe(mockStorage1);
    expect(result).not.toBe(mockStorage2);
  });

  it('should return the storage connection if it has been initialized', () => {
    const mockStorage = { storageType: 'mock' };

    initializeStorageConnection(mockStorage);
    const result = getStorageConnection();

    expect(result).toBe(mockStorage);
  });

  it('should throw an error if trying to get the storage connection before initialization', () => {
    expect(() => getStorageConnection()).toThrow('Storage connection has not been initialized.');
  });
});
