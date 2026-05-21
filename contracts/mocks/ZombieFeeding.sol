// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ZombieFactory.sol";

interface KittyInterface {
  function getKitty(uint256 _id) external view returns (
    bool isGestating,
    bool isReady,
    uint256 cooldownIndex,
    uint256 nextActionAt,
    uint256 siringWithId,
    uint256 birthTime,
    uint256 matronId,
    uint256 sireId,
    uint256 generation,
    uint256 genes
  );
}

contract ZombieFeeding is ZombieFactory {

  event RarePreyFed(uint256 indexed zombieId, string species, uint16 levelBonus);

  KittyInterface kittyContract;

  modifier onlyOwnerOf(uint256 _zombieId) {
    require(msg.sender == zombieToOwner[_zombieId]);
    _;
  }

  function setKittyContractAddress(address _address) external onlyOwner {
    kittyContract = KittyInterface(_address);
  }

  function _triggerCooldown(Zombie storage _zombie, uint256 _zombieId) internal {
    _zombie.readyTime = uint32(block.timestamp + _getCooldownDuration(_zombieId));
  }

  function _getCooldownDuration(uint256) internal view virtual returns (uint256) {
    return cooldownTime;
  }

  function _isReady(Zombie storage _zombie) internal view returns (bool) {
      return (_zombie.readyTime <= block.timestamp);
  }

  function _getSpeciesLevelBonus(string memory _species) internal pure returns (uint16) {
    bytes32 speciesHash = keccak256(abi.encodePacked(_species));
    if (speciesHash == keccak256(abi.encodePacked("kitty"))) {
      return 0;
    }
    if (speciesHash == keccak256(abi.encodePacked("dog"))) {
      return 1;
    }
    if (
      speciesHash == keccak256(abi.encodePacked("dragon")) ||
      speciesHash == keccak256(abi.encodePacked("alien"))
    ) {
      return 2;
    }
    return 0;
  }

  function _applySpeciesDnaMarker(uint256 _newDna, string memory _species) internal pure returns (uint256) {
    bytes32 speciesHash = keccak256(abi.encodePacked(_species));
    if (speciesHash == keccak256(abi.encodePacked("kitty"))) {
      return _newDna - _newDna % 100 + 99;
    }
    if (speciesHash == keccak256(abi.encodePacked("dog"))) {
      return _newDna - _newDna % 100 + 77;
    }
    if (
      speciesHash == keccak256(abi.encodePacked("dragon")) ||
      speciesHash == keccak256(abi.encodePacked("alien"))
    ) {
      return _newDna - _newDna % 100 + 88;
    }
    return _newDna;
  }

  function feedAndMultiply(uint256 _zombieId, uint256 _targetDna, string memory _species) internal onlyOwnerOf(_zombieId) {
    Zombie storage myZombie = zombies[_zombieId];
    require(_isReady(myZombie));
    _targetDna = _targetDna % dnaModulus;
    uint256 newDna = (myZombie.dna + _targetDna) / 2;
    newDna = _applySpeciesDnaMarker(newDna, _species);

    uint16 levelBonus = _getSpeciesLevelBonus(_species);
    if (levelBonus > 0) {
      myZombie.level += levelBonus;
      emit RarePreyFed(_zombieId, _species, levelBonus);
    }

    _createZombie("NoName", newDna);
    _triggerCooldown(myZombie, _zombieId);
  }

  function feedOnPrey(uint256 _zombieId, uint256 _targetDna, string calldata _species) public {
    require(_getSpeciesLevelBonus(_species) > 0, "Unknown or common prey species");
    feedAndMultiply(_zombieId, _targetDna, _species);
  }

  function feedOnKitty(uint256 _zombieId, uint256 _kittyId) public {
    uint256 kittyDna;
    (,,,,,,,,,kittyDna) = kittyContract.getKitty(_kittyId);
    feedAndMultiply(_zombieId, kittyDna, "kitty");
  }
}
