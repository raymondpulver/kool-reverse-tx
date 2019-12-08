pragma solidity ^0.5.13;

library FutureLib {
  bytes32 constant SECP256K1_N_DIV_2 = 0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;
  bytes32 constant SECP256K1_N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141;
  bytes32 constant SALT_R = 0xe3387399517ca5315a8112c67a51ea9f026127a55207ab9b66ddd432900520f7; // keccak("R value:\n")
  bytes32 constant SALT_S = 0x64df9cbe927ea85765c71cf33fa2f4e7c4d06a780c4d7ef1897eb0389e4bfd48; // keccak("S value:\n")
  struct ComputeReverseAddressResult {
    bytes32 msgHash;
    uint8 v;
    bytes32 r;
    bytes32 s;
  }
  function computeReverseAddressHelper(ComputeReverseAddressResult memory intermediate) internal pure {
    intermediate.r = bytes32((uint256(keccak256(abi.encodePacked(SALT_R, intermediate.r))) % uint256(SECP256K1_N)) + 0x1);
    intermediate.s = bytes32((uint256(keccak256(abi.encodePacked(SALT_S, intermediate.s))) % uint256(SECP256K1_N_DIV_2)) + 0x1);
    intermediate.v = uint8((uint256(intermediate.r) & 0x1) + 0x1b);
  }
  function computeReverseAddress(bytes memory input) internal returns (address result) {
    bytes32 startingHash = keccak256(input);
    ComputeReverseAddressResult memory intermediate = ComputeReverseAddressResult({
      msgHash: startingHash,
      r: startingHash,
      s: startingHash,
      v: uint8(0x0)
    });
    while (result == address(0x0)) {
      computeReverseAddressHelper(intermediate);
      result = ecrecover(intermediate.msgHash, intermediate.v, intermediate.r, intermediate.s);
    }
  }
  function computeContractAddressFromSeed(bytes memory input) internal returns (address result) {
    result = address(uint256(keccak256(abi.encodePacked(computeReverseAddress(input), uint256(0x0)))));
  }
}
    
contract Example {
  event Log(address indexed data);
  constructor() public {
    bytes memory input = abi.encodePacked(keccak256("woop"));
    address contractAddress = FutureLib.computeReverseAddress(input);
    emit Log(contractAddress);
  }
}
