// Global request throttling utility to prevent 429 errors

class RequestThrottle {
    constructor() {
        this.requestQueue = [];
        this.isProcessing = false;
        this.maxConcurrentRequests = 3; // Maximum concurrent requests
        this.requestDelay = 200; // Delay between requests in ms
        this.activeRequests = 0;

        this.pendingRequests = new Set();
    }

    // Add a request to the queue
    async queueRequest(requestFn, priority = 0) {
        return new Promise((resolve, reject) => {
            // CHANGES START: Store request object in pendingRequests
            const requestObj = {
                requestFn,
                priority,
                resolve,
                reject,
                timestamp: Date.now(),
                cancelled: false
            };
            this.requestQueue.push(requestObj);
            this.pendingRequests.add(requestObj);
            // CHANGES END

            // Sort by priority (higher priority first)
            this.requestQueue.sort((a, b) => b.priority - a.priority);

            this.processQueue();
        });
    }


    // Process the request queue
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
            const request = this.requestQueue.shift();
            this.activeRequests++;

            // Execute the request
            this.executeRequest(request);
        }

        this.isProcessing = false;
    }

    // Execute a single request
    async executeRequest(request) {
        // CHANGES START: Handle cancelled requests
        if (request.cancelled) {
            request.reject(new Error('Request cancelled'));
            this.pendingRequests.delete(request);
            this.activeRequests--;
            setTimeout(() => this.processQueue(), this.requestDelay);
            return;
        }
        // CHANGES END
        try {
            const result = await request.requestFn();
            request.resolve(result);
        } catch (error) {
            request.reject(error);
        } finally {
            // CHANGES START: Remove from pendingRequests
            this.pendingRequests.delete(request);
            // CHANGES END
            this.activeRequests--;

            // Add delay before processing next request
            setTimeout(() => {
                this.processQueue();
            }, this.requestDelay);
        }
    }

    // Clear the queue (useful for cleanup)
    clearQueue() {
        // CHANGES START: Cancel and reject all requests (queued and running)
        this.requestQueue.forEach(request => {
            request.cancelled = true;
            request.reject(new Error('Request cancelled'));
            this.pendingRequests.delete(request);
        });
        this.requestQueue = [];
        this.pendingRequests.forEach(request => {
            if (!request.cancelled) {
                request.cancelled = true;
                request.reject(new Error('Request cancelled'));
            }
        });
        this.pendingRequests.clear();
        // CHANGES END
    }
}

// Create a global instance
export const requestThrottle = new RequestThrottle();

// Priority levels
export const REQUEST_PRIORITY = {
    HIGH: 3,      // Critical user data (profile, auth)
    MEDIUM: 2,    // Important data (friends, feed)
    LOW: 1,       // Secondary data (suggestions, stats)
    BACKGROUND: 0 // Background tasks
};

// Helper function to wrap API calls with throttling
export function throttledRequest(requestFn, priority = REQUEST_PRIORITY.MEDIUM) {
    return requestThrottle.queueRequest(requestFn, priority);
}

