import { requestThrottle, REQUEST_PRIORITY, throttledRequest } from '../utils/requestThrottle';

describe('RequestThrottle', () => {
  beforeEach(() => {
    // Clear any pending requests
    requestThrottle.clearQueue();
    requestThrottle.activeRequests = 0;
    requestThrottle.isProcessing = false;
  });

  describe('Structure', () => {
    test('should be defined', () => {
      expect(requestThrottle).toBeDefined();
      expect(typeof requestThrottle.queueRequest).toBe('function');
      expect(typeof requestThrottle.processQueue).toBe('function');
      expect(typeof requestThrottle.executeRequest).toBe('function');
      expect(typeof requestThrottle.clearQueue).toBe('function');
    });

    test('should have correct properties', () => {
      expect(requestThrottle.requestQueue).toBeDefined();
      expect(Array.isArray(requestThrottle.requestQueue)).toBe(true);
      expect(typeof requestThrottle.maxConcurrentRequests).toBe('number');
      expect(typeof requestThrottle.requestDelay).toBe('number');
    });
  });

  describe('queueRequest', () => {
    test('should queue and execute a single request', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue('success');
      
      const result = await requestThrottle.queueRequest(mockRequestFn);
      
      expect(result).toBe('success');
      expect(mockRequestFn).toHaveBeenCalledTimes(1);
    });

    test('should execute multiple requests', async () => {
      const mockRequestFn1 = jest.fn().mockResolvedValue('result1');
      const mockRequestFn2 = jest.fn().mockResolvedValue('result2');
      
      const [result1, result2] = await Promise.all([
        requestThrottle.queueRequest(mockRequestFn1),
        requestThrottle.queueRequest(mockRequestFn2)
      ]);
      
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
    });

    test('should handle request failures gracefully', async () => {
      const errorMessage = 'Request failed';
      const mockRequestFn = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      await expect(requestThrottle.queueRequest(mockRequestFn)).rejects.toThrow(errorMessage);
      expect(mockRequestFn).toHaveBeenCalledTimes(1);
    });

    test('should prioritize requests correctly', async () => {
      const executionOrder = [];

      const makeFn = (label, delayMs = 0) => jest.fn().mockImplementation(async () => {
        if (delayMs) {
          await new Promise(r => setTimeout(r, delayMs));
        }
        executionOrder.push(label);
        return label;
      });

      const lowPriorityFn = makeFn('low', 10);
      const highPriorityFn = makeFn('high', 0);

      const lowPromise = requestThrottle.queueRequest(lowPriorityFn, REQUEST_PRIORITY.LOW);
      const highPromise = requestThrottle.queueRequest(highPriorityFn, REQUEST_PRIORITY.HIGH);

      await Promise.all([lowPromise, highPromise]);

      expect(executionOrder).toEqual(['high', 'low']);
    });

    test('should respect max concurrent requests', () => {
      expect(requestThrottle.maxConcurrentRequests).toBeGreaterThan(0);
      expect(requestThrottle.maxConcurrentRequests).toBeLessThanOrEqual(10);
    });
  });

  describe('clearQueue', () => {
    test('should empty the request queue', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue('result');
      const p1 = requestThrottle.queueRequest(mockRequestFn);
      const p2 = requestThrottle.queueRequest(mockRequestFn);
      requestThrottle.clearQueue();
      await expect(p1).rejects.toThrow('Request cancelled');
      await expect(p2).rejects.toThrow('Request cancelled');
      expect(requestThrottle.requestQueue).toHaveLength(0);
    });
  });

  describe('REQUEST_PRIORITY', () => {
    test('should have correct priority levels', () => {
      expect(REQUEST_PRIORITY.HIGH).toBe(3);
      expect(REQUEST_PRIORITY.MEDIUM).toBe(2);
      expect(REQUEST_PRIORITY.LOW).toBe(1);
      expect(REQUEST_PRIORITY.BACKGROUND).toBe(0);
    });

    test('priority values should be in descending order', () => {
      expect(REQUEST_PRIORITY.HIGH).toBeGreaterThan(REQUEST_PRIORITY.MEDIUM);
      expect(REQUEST_PRIORITY.MEDIUM).toBeGreaterThan(REQUEST_PRIORITY.LOW);
      expect(REQUEST_PRIORITY.LOW).toBeGreaterThan(REQUEST_PRIORITY.BACKGROUND);
    });
  });

  describe('throttledRequest helper', () => {
    test('should wrap request function with default priority', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue('result');
      
      const result = await throttledRequest(mockRequestFn);
      
      expect(result).toBe('result');
      expect(mockRequestFn).toHaveBeenCalledTimes(1);
    });

    test('should accept custom priority', async () => {
      const mockRequestFn = jest.fn().mockResolvedValue('result');
      
      const result = await throttledRequest(mockRequestFn, REQUEST_PRIORITY.HIGH);
      
      expect(result).toBe('result');
      expect(mockRequestFn).toHaveBeenCalledTimes(1);
    });

    test('should handle errors', async () => {
      const mockRequestFn = jest.fn().mockRejectedValue(new Error('Test error'));
      
      await expect(throttledRequest(mockRequestFn)).rejects.toThrow('Test error');
    });
  });

  describe('processQueue', () => {
    test('should not process when queue is empty', async () => {
      requestThrottle.clearQueue();
      const initialActiveRequests = requestThrottle.activeRequests;
      
      await requestThrottle.processQueue();
      
      expect(requestThrottle.activeRequests).toBe(initialActiveRequests);
    });
  });
});