// Mock Mongoose
jest.unstable_mockModule('mongoose', () => ({
  default: {
    connect: jest.fn().mockResolvedValue({
      connection: { host: 'mongodb://test' }
    }),
    disconnect: jest.fn().mockResolvedValue(),
    model: jest.fn().mockImplementation((name) => {
      // Return model mock based on name
      const ModelMock = jest.fn().mockImplementation((data) => ({
        _id: '507f1f77bcf86cd799439011',
        ...data,
        save: jest.fn().mockResolvedValue(this),
        updateLastLogin: jest.fn().mockResolvedValue(this),
        canRequestOTP: jest.fn().mockReturnValue(true)
      }));
      
      // Static methods
      ModelMock.findOne = jest.fn();
      ModelMock.findById = jest.fn();
      ModelMock.find = jest.fn();
      ModelMock.create = jest.fn();
      ModelMock.findByIdAndUpdate = jest.fn();
      ModelMock.findByIdAndDelete = jest.fn();
      ModelMock.deleteOne = jest.fn();
      ModelMock.deleteMany = jest.fn();
      ModelMock.aggregate = jest.fn();
      
      return ModelMock;
    }),
    Schema: class {},
    Types: {
      ObjectId: class {
        constructor(id = '507f1f77bcf86cd799439011') {
          this.id = id;
          this.toString = () => id;
        }
      }
    }
  }
}));

// Mock Twilio service
jest.unstable_mockModule('../src/services/twilioService.js', () => ({
  sendOTP: jest.fn().mockResolvedValue({
    success: true,
    status: 'pending',
    to: '+919876543210'
  }),
  verifyOTP: jest.fn().mockResolvedValue({
    success: true,
    status: 'approved',
    valid: true
  }),
  isTwilioConfigured: jest.fn().mockReturnValue(true)
}));

// Mock dotenv to prevent errors
jest.unstable_mockModule('dotenv', () => ({
  config: jest.fn()
}));

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
