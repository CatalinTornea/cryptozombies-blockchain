import { ethers } from "hardhat";
import { ZombieOwnership } from "../../typechain-types";
import { getContractAddress } from "../lib/getContractAddress";

/**
 * Feed your zombie on rare prey (dog, dragon, alien).
 * Rare species grant bonus levels to the parent zombie.
 *
 * Usage:
 *   ZOMBIE_ID=0 PREY_DNA=555555555555555500 PREY_SPECIES=dragon npm run interact:feedrare
 */

async function main() {
  const contractAddress = getContractAddress();
  const zombieId = process.env.ZOMBIE_ID;
  const preyDna = process.env.PREY_DNA;
  const preySpecies = process.env.PREY_SPECIES;

  if (!zombieId || !preyDna || !preySpecies) {
    console.error("Missing required environment variables.");
    console.log("\nUsage:");
    console.log(
      '  ZOMBIE_ID=0 PREY_DNA=555555555555555500 PREY_SPECIES=dragon npm run interact:feedrare'
    );
    console.log("\nSupported species: dog (+1 level), dragon (+2 levels), alien (+2 levels)");
    process.exit(1);
  }

  console.log("Feeding on rare prey...\n");
  console.log("Contract:", contractAddress);
  console.log("Zombie ID:", zombieId);
  console.log("Prey DNA:", preyDna);
  console.log("Species:", preySpecies);

  const [signer] = await ethers.getSigners();
  const contract = (await ethers.getContractAt(
    "ZombieOwnership",
    contractAddress
  )) as unknown as ZombieOwnership;

  const id = BigInt(zombieId);
  const before = await contract.zombies(id);
  console.log("\nBefore - Level:", before.level.toString());

  const tx = await contract.feedOnPrey(id, BigInt(preyDna), preySpecies);
  console.log("Transaction:", tx.hash);
  await tx.wait();

  const after = await contract.zombies(id);
  const zombies = await contract.getZombiesByOwner(signer.address);
  const newestId = zombies[zombies.length - 1];
  const child = await contract.zombies(newestId);

  console.log("\nAfter - Level:", after.level.toString());
  console.log("New offspring ID:", newestId.toString());
  console.log("Offspring DNA suffix:", Number(child.dna % 100n));
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nError:", error.message);
    process.exit(1);
  });
