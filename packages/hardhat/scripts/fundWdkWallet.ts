import { ethers } from "hardhat";

/**
 * Fund a WDK wallet address with AVAX from the pre-funded local account
 * 
 * Usage:
 *   yarn hardhat run scripts/fundWdkWallet.ts --network avalancheLocal
 * 
 * The script will prompt you to paste your WDK wallet address
 */
async function main() {
  console.log("\n🎯 WDK Wallet Funding Script");
  console.log("================================\n");

  // Get the pre-funded account (ewoq)
  const [funder] = await ethers.getSigners();
  const funderAddress = await funder.getAddress();
  const funderBalance = await ethers.provider.getBalance(funderAddress);

  console.log("💰 Funding Account (ewoq):");
  console.log("   Address:", funderAddress);
  console.log("   Balance:", ethers.formatEther(funderBalance), "AVAX\n");

  // Get recipient address from environment variable
  const recipientAddress = process.env.WDK_WALLET_ADDRESS;

  if (!recipientAddress) {
    console.log("❌ Error: No recipient address provided");
    console.log("\nUsage:");
    console.log("  yarn fund:local 0xYourWalletAddress");
    console.log("\nOr set WDK_WALLET_ADDRESS environment variable:");
    console.log("  WDK_WALLET_ADDRESS=0x... yarn fund:local");
    console.log("\n💡 Tip: Copy your WDK wallet address from the Wallet Manager UI");
    process.exit(1);
  }

  // Validate address
  if (!ethers.isAddress(recipientAddress)) {
    console.log("❌ Error: Invalid Ethereum address:", recipientAddress);
    process.exit(1);
  }

  console.log("📬 Recipient (WDK Wallet):");
  console.log("   Address:", recipientAddress);

  const recipientBalance = await ethers.provider.getBalance(recipientAddress);
  console.log("   Current Balance:", ethers.formatEther(recipientBalance), "AVAX\n");

  // Amount to send (100 AVAX for testing)
  const amount = ethers.parseEther("100");

  console.log("💸 Transferring", ethers.formatEther(amount), "AVAX...\n");

  // Send transaction
  const tx = await funder.sendTransaction({
    to: recipientAddress,
    value: amount,
  });

  console.log("📤 Transaction sent!");
  console.log("   Hash:", tx.hash);
  console.log("   Waiting for confirmation...\n");

  // Wait for confirmation
  const receipt = await tx.wait();

  console.log("✅ Transaction confirmed!");
  console.log("   Block:", receipt?.blockNumber);
  console.log("   Gas Used:", receipt?.gasUsed.toString());

  // Check new balance
  const newBalance = await ethers.provider.getBalance(recipientAddress);
  console.log("\n💰 New Balance:");
  console.log("   WDK Wallet:", ethers.formatEther(newBalance), "AVAX");
  
  const newFunderBalance = await ethers.provider.getBalance(funderAddress);
  console.log("   Funder:", ethers.formatEther(newFunderBalance), "AVAX");

  console.log("\n🎉 Funding complete! Your WDK wallet is ready to send transactions.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });

