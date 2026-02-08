import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';

export class HeliusRPC {
  private connection: Connection;
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.HELIUS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('HELIUS_API_KEY not set. Get from: https://dev.helius.xyz');
    }
    
    this.connection = new Connection(
      `https://rpc.helius.xyz/?api-key=${this.apiKey}`,
      'confirmed'
    );
  }
  
  /**
   * Get SOL balance for an address
   */
  async getBalance(address: string): Promise<number> {
    try {
      const pubkey = new PublicKey(address);
      const balance = await this.connection.getBalance(pubkey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get token accounts for an address
   */
  async getTokenAccounts(address: string) {
    try {
      const pubkey = new PublicKey(address);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });
      return tokenAccounts.value.map(account => ({
        pubkey: account.pubkey.toString(),
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals
      }));
    } catch (error) {
      throw new Error(`Failed to get token accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get transaction details
   */
  async getTransaction(signature: string): Promise<ParsedTransactionWithMeta | null> {
    try {
      return await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get parsed transaction with enhanced metadata
   */
  async getParsedTransaction(signature: string) {
    const tx = await this.getTransaction(signature);
    if (!tx) return null;
    
    return {
      signature,
      blockTime: tx.blockTime,
      meta: tx.meta,
      transaction: tx.transaction
    };
  }
  
  /**
   * Get program accounts
   */
  async getProgramAccounts(programId: string, filters?: any[]) {
    try {
      const pubkey = new PublicKey(programId);
      return await this.connection.getParsedProgramAccounts(pubkey, {
        filters: filters || []
      });
    } catch (error) {
      throw new Error(`Failed to get program accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get signatures for an address
   */
  async getSignaturesForAddress(address: string, limit: number = 10) {
    try {
      const pubkey = new PublicKey(address);
      return await this.connection.getSignaturesForAddress(pubkey, { limit });
    } catch (error) {
      throw new Error(`Failed to get signatures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
