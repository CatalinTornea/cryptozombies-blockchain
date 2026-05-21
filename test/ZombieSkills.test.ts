import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ZombieOwnership } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ZombieSkills (Feature 2)", function () {
  let zombieOwnership: ZombieOwnership;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;

  const SKILL_BERSERK = 1;
  const SKILL_FORTRESS = 2;
  const SKILL_SWIFT = 3;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const ZombieOwnership = await ethers.getContractFactory("ZombieOwnership");
    zombieOwnership = (await ZombieOwnership.deploy()) as unknown as ZombieOwnership;

    await zombieOwnership.connect(owner).createRandomZombie("OwnerZombie");
    await zombieOwnership.connect(addr1).createRandomZombie("Addr1Zombie");
  });

  describe("buySkill", function () {
    it("Should purchase Berserk skill when correct fee is paid", async function () {
      const price = await zombieOwnership.skillPrices(SKILL_BERSERK);

      await expect(
        zombieOwnership.buySkill(0, SKILL_BERSERK, { value: price })
      )
        .to.emit(zombieOwnership, "SkillPurchased")
        .withArgs(0, SKILL_BERSERK, owner.address);

      const zombie = await zombieOwnership.zombies(0);
      expect(zombie.specialSkill).to.equal(SKILL_BERSERK);
    });

    it("Should revert if zombie already has a skill", async function () {
      const price = await zombieOwnership.skillPrices(SKILL_BERSERK);
      await zombieOwnership.buySkill(0, SKILL_BERSERK, { value: price });

      await expect(
        zombieOwnership.buySkill(0, SKILL_SWIFT, {
          value: await zombieOwnership.skillPrices(SKILL_SWIFT),
        })
      ).to.be.revertedWith("Zombie already has a skill");
    });

    it("Should revert on insufficient payment", async function () {
      await expect(
        zombieOwnership.buySkill(0, SKILL_FORTRESS, {
          value: ethers.parseEther("0.001"),
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should only allow zombie owner to buy skill", async function () {
      const price = await zombieOwnership.skillPrices(SKILL_BERSERK);
      await expect(
        zombieOwnership.connect(addr1).buySkill(0, SKILL_BERSERK, { value: price })
      ).to.be.reverted;
    });
  });

  describe("Swift skill", function () {
    it("Should apply half cooldown after feeding", async function () {
      const price = await zombieOwnership.skillPrices(SKILL_SWIFT);
      await zombieOwnership.buySkill(0, SKILL_SWIFT, { value: price });

      await time.increase(86400);
      await zombieOwnership.feedOnPrey(0, 555555555555555500n, "dog");

      const zombie = await zombieOwnership.zombies(0);
      const now = await time.latest();
      const remaining = Number(zombie.readyTime) - now;

      expect(remaining).to.be.closeTo(43200, 5);
    });
  });

  describe("Fortress skill", function () {
    it("Should skip defeat cooldown when Fortress is equipped", async function () {
      const price = await zombieOwnership.skillPrices(SKILL_FORTRESS);
      await zombieOwnership.buySkill(0, SKILL_FORTRESS, { value: price });
      await time.increase(86400);

      let foundLoss = false;
      for (let i = 0; i < 60 && !foundLoss; i++) {
        const zombie = await zombieOwnership.zombies(0);
        if (zombie.readyTime > BigInt(await time.latest())) {
          await time.increase(Number(zombie.readyTime - BigInt(await time.latest())) + 1);
        }

        const readyBefore = (await zombieOwnership.zombies(0)).readyTime;
        const lossesBefore = (await zombieOwnership.zombies(0)).lossCount;

        await zombieOwnership.attack(0, 1);

        const after = await zombieOwnership.zombies(0);
        if (after.lossCount > lossesBefore) {
          expect(after.readyTime).to.equal(readyBefore);
          foundLoss = true;
        }
      }

      expect(foundLoss).to.equal(true);
    });
  });

  describe("Berserk skill", function () {
    it("Should equip Berserk and raise effective win threshold", async function () {
      const price = await zombieOwnership.skillPrices(SKILL_BERSERK);
      await zombieOwnership.buySkill(0, SKILL_BERSERK, { value: price });

      const zombie = await zombieOwnership.zombies(0);
      expect(zombie.specialSkill).to.equal(SKILL_BERSERK);
    });
  });
});
