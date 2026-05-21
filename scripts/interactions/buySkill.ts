import { ethers } from "hardhat";
import { ZombieOwnership } from "../../typechain-types";
import { getContractAddress } from "../lib/getContractAddress";

/**
 * Buy a special skill for your zombie.
 *
 * Skills:
 *   1 = Berserk  (0.005 ETH) - +15% attack win chance
 *   2 = Fortress (0.003 ETH) - no cooldown on defeat
 *   3 = Swift    (0.004 ETH) - half cooldown duration
 *
 * Usage:
 *   ZOMBIE_ID=0 SKILL_ID=1 npm run interact:buyskill
 */

const SKILL_NAMES: Record<number, string> = {
  1: "Berserk",
  2: "Fortress",
  3: "Swift",
};

async function main() {
  const contractAddress = getContractAddress();
  const zombieId = process.env.ZOMBIE_ID;
  const skillId = process.env.SKILL_ID;

  if (!zombieId || !skillId) {
    console.error("Missing ZOMBIE_ID or SKILL_ID.");
    console.log("\nUsage:");
    console.log("  ZOMBIE_ID=0 SKILL_ID=1 npm run interact:buyskill");
    process.exit(1);
  }

  const skill = Number(skillId);
  if (!SKILL_NAMES[skill]) {
    console.error("Invalid SKILL_ID. Use 1 (Berserk), 2 (Fortress), or 3 (Swift).");
    process.exit(1);
  }

  const contract = (await ethers.getContractAt(
    "ZombieOwnership",
    contractAddress
  )) as unknown as ZombieOwnership;

  const id = BigInt(zombieId);
  const price = await contract.skillPrices(skill);
  const zombieBefore = await contract.zombies(id);

  if (zombieBefore.specialSkill !== 0n) {
    console.error("This zombie already has skill ID", zombieBefore.specialSkill.toString());
    process.exit(1);
  }

  console.log("Buying skill...\n");
  console.log("Zombie ID:", zombieId);
  console.log("Skill:", SKILL_NAMES[skill]);
  console.log("Price:", ethers.formatEther(price), "ETH");

  const tx = await contract.buySkill(id, skill, { value: price });
  console.log("Transaction:", tx.hash);
  await tx.wait();

  const zombieAfter = await contract.zombies(id);
  console.log("\nSkill equipped:", zombieAfter.specialSkill.toString(), "-", SKILL_NAMES[skill]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nError:", error.message);
    process.exit(1);
  });
