import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting TokenVault deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📍 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  console.log("⏳ Deploying TokenVault contract...");
  const TokenVault = await ethers.getContractFactory("TokenVault");
  const vault = await TokenVault.deploy();

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ TokenVault deployed to:", vaultAddress);
  console.log("🔗 Transaction hash:", vault.deploymentTransaction()?.hash);
  console.log("⛽ Gas used:", (await vault.deploymentTransaction()?.wait())?.gasUsed.toString());

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await vault.owner();
  const paused = await vault.paused();
  const minDeposit = await vault.MIN_DEPOSIT();
  const maxDeposit = await vault.MAX_DEPOSIT();

  console.log("Owner:", owner);
  console.log("Paused:", paused);
  console.log("Min Deposit:", ethers.formatEther(minDeposit), "ETH");
  console.log("Max Deposit:", ethers.formatEther(maxDeposit), "ETH");

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: vaultAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: vault.deploymentTransaction()?.hash,
  };

  // Save to frontend directory
  const frontendDir = path.join(__dirname, "..", "frontend", "src");
  const deploymentPath = path.join(frontendDir, "deployment.json");

  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // Save ABI
  const abiDir = path.join(frontendDir, "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  const artifact = await ethers.getContractFactory("TokenVault");
  const abiPath = path.join(abiDir, "TokenVault.json");
  fs.writeFileSync(
    abiPath,
    JSON.stringify(
      {
        abi: artifact.interface.formatJson(),
        contractName: "TokenVault",
      },
      null,
      2
    )
  );
  console.log("📄 ABI saved to:", abiPath);

  // Print environment variable
  console.log("\n📝 Add this to your frontend .env file:");
  console.log(`VITE_CONTRACT_ADDRESS=${vaultAddress}`);
  console.log(`VITE_CHAIN_ID=${network.chainId}`);

  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
