import { Connection, PublicKey } from '@solana/web3.js';

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: any[];
}

export interface JupiterSwapParams {
  quote: JupiterQuote;
  userPublicKey: string;
  slippageBps?: number;
}

export class JupiterAPI {
  private baseUrl = 'https://quote-api.jup.ag/v6';
  private connection?: Connection;
  
  constructor(connection?: Connection) {
    this.connection = connection;
  }
  
  /**
   * Get a quote for swapping tokens
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50 // 0.5% default slippage
  ): Promise<JupiterQuote> {
    try {
      const url = new URL(`${this.baseUrl}/quote`);
      url.searchParams.set('inputMint', inputMint);
      url.searchParams.set('outputMint', outputMint);
      url.searchParams.set('amount', amount.toString());
      url.searchParams.set('slippageBps', slippageBps.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.statusText}`);
      }
      
      const quote = await response.json();
      return quote;
    } catch (error) {
      throw new Error(`Failed to get quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get current price for a token pair
   */
  async getPrice(inputMint: string, outputMint: string): Promise<number> {
    const quote = await this.getQuote(inputMint, outputMint, 1000000); // Use 1 token as base
    const inAmount = parseFloat(quote.inAmount);
    const outAmount = parseFloat(quote.outAmount);
    
    if (inAmount === 0) return 0;
    return outAmount / inAmount;
  }
  
  /**
   * Get swap route
   */
  async getRoute(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ) {
    const quote = await this.getQuote(inputMint, outputMint, amount, slippageBps);
    return {
      quote,
      route: quote.routePlan,
      priceImpact: quote.priceImpactPct
    };
  }
  
  /**
   * Execute a swap (requires wallet connection)
   * Note: This is a simplified version. Full implementation requires wallet adapter
   */
  async swapTokens(params: JupiterSwapParams) {
    if (!this.connection) {
      throw new Error('Connection required for swap execution');
    }
    
    // This is a placeholder - full swap implementation requires:
    // 1. Get swap transaction from Jupiter API
    // 2. Sign transaction with user's wallet
    // 3. Send transaction to network
    
    return {
      success: false,
      message: 'Swap execution requires wallet integration. Use Jupiter SDK for full implementation.',
      params
    };
  }
}
