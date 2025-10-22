// Mock contract for testing the frontend
// This simulates the contract behavior without actually deploying

export const mockContract = {
  // Simulate minting a pack
  async mintPack(_to?: string, _quantity?: number): Promise<{ success: boolean; tokenIds: number[]; transactionHash?: string; error?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate random token IDs
    const quantity = _quantity || 3;
    const to = _to || '0x1234567890123456789012345678901234567890';
    const tokenIds = Array.from({ length: quantity }, (_, i) => Math.floor(Math.random() * 1000000) + i + 1);
    
    // Simulate transaction hash
    const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    console.log(`Mock: Minted ${quantity} NFTs to ${to}`);
    console.log(`Mock: Token IDs: ${tokenIds.join(', ')}`);
    console.log(`Mock: Transaction Hash: ${transactionHash}`);
    
    return {
      success: true,
      tokenIds,
      transactionHash
    };
  },
  
  // Simulate getting total supply
  async totalSupply(): Promise<number> {
    return Math.floor(Math.random() * 1000) + 100;
  },
  
  // Simulate getting balance
  async balanceOf(_address: string): Promise<number> {
    return Math.floor(Math.random() * 10);
  }
};
