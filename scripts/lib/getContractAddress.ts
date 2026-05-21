import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

/** First contract address on a fresh Hardhat local node. */
const DEFAULT_LOCALHOST_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export function getContractAddress(): string {
  if (process.env.CONTRACT_ADDRESS) {
    return process.env.CONTRACT_ADDRESS;
  }

  const deploymentFile = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}.json`
  );

  if (fs.existsSync(deploymentFile)) {
    const data = JSON.parse(fs.readFileSync(deploymentFile, "utf8")) as {
      ZombieOwnership?: string;
    };
    if (data.ZombieOwnership) {
      return data.ZombieOwnership;
    }
  }

  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    return DEFAULT_LOCALHOST_ADDRESS;
  }

  throw new Error(
    "CONTRACT_ADDRESS not set. Run npm run deploy:local first, or set $env:CONTRACT_ADDRESS."
  );
}
