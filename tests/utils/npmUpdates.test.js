const axios = require('axios');
const NPMUpdates = require('../../lib/main/server/utils/npmUpdates');
jest.mock('axios');
/* globals expect, jest, it,  describe, afterEach */
describe('NPMUpdates.fetchLatestVersion', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the latest version if the response is successful and contains a version', async () => {
    const packageName = 'some-package';
    const version = '1.2.3';
    axios.mockResolvedValue({ status: 200, data: { version } });

    const result = await NPMUpdates.fetchLatestVersion(packageName);

    expect(result).toBe(version);
  });

  it('should return "0.0.0" if the response is successful but no version is found', async () => {
    const packageName = 'some-package';
    axios.mockResolvedValue({ status: 200, data: {} });

    const result = await NPMUpdates.fetchLatestVersion(packageName);

    expect(result).toBe('0.0.0');
  });

  it('should throw an error if the response status is not 200', async () => {
    const packageName = 'some-package';
    axios.mockResolvedValue({ status: 404 });

    await expect(NPMUpdates.fetchLatestVersion(packageName)).rejects.toThrow('badRequest');
  });

  it('should throw an error if the response contains no data', async () => {
    const packageName = 'some-package';
    axios.mockResolvedValue({ status: 200 });

    await expect(NPMUpdates.fetchLatestVersion(packageName)).rejects.toThrow('badRequest');
  });

  it('should throw an error if axios throws an error', async () => {
    const packageName = 'some-package';
    axios.mockRejectedValue(new Error('network error'));

    await expect(NPMUpdates.fetchLatestVersion(packageName)).rejects.toThrow('network error');
  });
});
