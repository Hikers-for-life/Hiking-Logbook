// Mock for Leaflet
module.exports = {
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn(),
    },
  },
  Icon: jest.fn(() => ({})),
};
