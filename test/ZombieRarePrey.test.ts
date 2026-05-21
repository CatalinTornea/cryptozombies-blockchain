import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ZombieOwnership } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ZombieRarePrey (Feature 1)", function () {
  let zombieOwnership: ZombieOwnership;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const ZombieOwnership = await ethers.getContractFactory("ZombieOwnership");
    zombieOwnership = (await ZombieOwnership.deploy()) as unknown as ZombieOwnership;

    await zombieOwnership.connect(owner).createRandomZombie("OwnerZombie");
    await zombieOwnership.connect(addr1).createRandomZombie("Addr1Zombie");
    await time.increase(86400);
  });

  it("Should level up by 2 when feeding on dragon prey", async function () {
    const levelBefore = (await zombieOwnership.zombies(0)).level;

    await expect(zombieOwnership.feedOnPrey(0, 555555555555555500n, "dragon"))
      .to.emit(zombieOwnership, "RarePreyFed")
      .withArgs(0, "dragon", 2);

    const levelAfter = (await zombieOwnership.zombies(0)).level;
    expect(levelAfter).to.equal(levelBefore + 2n);

    const child = await zombieOwnership.zombies(2);
    expect(Number(child.dna) % 100).to.equal(88);
  });

  it("Should level up by 1 when feeding on dog prey", async function () {
    const levelBefore = (await zombieOwnership.zombies(0)).level;

    await zombieOwnership.feedOnPrey(0, 111111111111111100n, "dog");

    const levelAfter = (await zombieOwnership.zombies(0)).level;
    expect(levelAfter).to.equal(levelBefore + 1n);

    const child = await zombieOwnership.zombies(2);
    expect(Number(child.dna) % 100).to.equal(77);
  });

  it("Should not level up parent when feeding on kitty", async function () {
    const MockKitty = await ethers.getContractFactory("MockCryptoKitties");
    const mockKitty = await MockKitty.deploy();
    await zombieOwnership.setKittyContractAddress(await mockKitty.getAddress());

    const levelBefore = (await zombieOwnership.zombies(0)).level;
    await zombieOwnership.feedOnKitty(0, 1);
    const levelAfter = (await zombieOwnership.zombies(0)).level;

    expect(levelAfter).to.equal(levelBefore);
  });

  it("Should reject unknown prey species", async function () {
    await expect(
      zombieOwnership.feedOnPrey(0, 123n, "unicorn")
    ).to.be.revertedWith("Unknown or common prey species");
  });

  it("Should only allow zombie owner to feed on rare prey", async function () {
    await expect(
      zombieOwnership.connect(addr1).feedOnPrey(0, 555n, "dragon")
    ).to.be.reverted;
  });
});
