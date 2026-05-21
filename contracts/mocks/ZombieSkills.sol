// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ZombieFeeding.sol";

contract ZombieSkills is ZombieFeeding {

  uint8 public constant SKILL_NONE = 0;
  uint8 public constant SKILL_BERSERK = 1;
  uint8 public constant SKILL_FORTRESS = 2;
  uint8 public constant SKILL_SWIFT = 3;

  mapping(uint8 => uint256) public skillPrices;

  event SkillPurchased(uint256 indexed zombieId, uint8 skillId, address buyer);

  constructor() {
    skillPrices[SKILL_BERSERK] = 0.005 ether;
    skillPrices[SKILL_FORTRESS] = 0.003 ether;
    skillPrices[SKILL_SWIFT] = 0.004 ether;
  }

  function buySkill(uint256 _zombieId, uint8 _skillId) external payable onlyOwnerOf(_zombieId) {
    require(_skillId >= SKILL_BERSERK && _skillId <= SKILL_SWIFT, "Invalid skill");
    require(zombies[_zombieId].specialSkill == SKILL_NONE, "Zombie already has a skill");
    require(msg.value >= skillPrices[_skillId], "Insufficient payment");

    zombies[_zombieId].specialSkill = _skillId;
    emit SkillPurchased(_zombieId, _skillId, msg.sender);
  }

  function setSkillPrice(uint8 _skillId, uint256 _price) external onlyOwner {
    require(_skillId >= SKILL_BERSERK && _skillId <= SKILL_SWIFT, "Invalid skill");
    skillPrices[_skillId] = _price;
  }

  function _getAttackBonus(uint256 _zombieId) internal view returns (uint256) {
    if (zombies[_zombieId].specialSkill == SKILL_BERSERK) {
      return 15;
    }
    return 0;
  }

  function _hasFortressSkill(uint256 _zombieId) internal view returns (bool) {
    return zombies[_zombieId].specialSkill == SKILL_FORTRESS;
  }

  function _getCooldownDuration(uint256 _zombieId) internal view override returns (uint256) {
    if (zombies[_zombieId].specialSkill == SKILL_SWIFT) {
      return cooldownTime / 2;
    }
    return cooldownTime;
  }

}
