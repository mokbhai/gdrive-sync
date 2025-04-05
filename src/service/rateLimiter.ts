// Rate limiter configuration
const REQUESTS_PER_SECOND = 100; // Increased from 50 to 100 requests per second
const BURST_SIZE = 200; // Increased from 100 to 200 for better burst handling

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private readonly burstSize: number;

  constructor(requestsPerSecond: number, burstSize: number) {
    this.maxTokens = requestsPerSecond;
    this.tokens = requestsPerSecond;
    this.lastRefill = Date.now();
    this.refillRate = 1000 / requestsPerSecond; // Time between tokens in ms
    this.burstSize = burstSize;
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillRate);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  async acquire(): Promise<void> {
    this.refillTokens();

    if (this.tokens <= 0) {
      const waitTime = this.refillRate - (Date.now() - this.lastRefill);
      if (waitTime > 0) {
        await sleep(waitTime);
      }
    }

    this.tokens--;
  }

  async acquireBurst(count: number): Promise<void> {
    const actualCount = Math.min(count, this.burstSize);
    for (let i = 0; i < actualCount; i++) {
      await this.acquire();
    }
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const rateLimiter = new RateLimiter(REQUESTS_PER_SECOND, BURST_SIZE);

export { rateLimiter, sleep };
