'use strict';

const {
	leftPad,
	soliditySha3,
	toBN,
	toHex
} = require('web3-utils');

const {
	stripHexPrefix,
	addHexPrefix,
	toBuffer,
	ecrecover,
  publicToAddress,
  bufferToHex
} = require('ethereumjs-util');

const SECP256K1_N_DIV_2 = toBN('0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0');
const SECP256K1_N = toBN('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');
const SALT_R = '0xe3387399517ca5315a8112c67a51ea9f026127a55207ab9b66ddd432900520f7'; // keccak("R value:\n")
const SALT_S = '0x64df9cbe927ea85765c71cf33fa2f4e7c4d06a780c4d7ef1897eb0389e4bfd48'; // keccak("S value:\n")

const next = (input, salt, modulus) => toBN(soliditySha3({
	t: 'bytes32',
	v: salt
}, {
	t: 'bytes32',
	v: input
})).mod(modulus).add(toBN(0x1));

const toWord = (bn) => addHexPrefix(leftPad(stripHexPrefix(toHex(bn)), 0x40));

const helper = (rBytes, sBytes) => {
	const rBN = next(rBytes, SALT_R, SECP256K1_N);
	const sBN = next(sBytes, SALT_S, SECP256K1_N_DIV_2);
	const v = Number(rBN.and(toBN(0x1))) + 0x1b;
	return {
		v,
		r: toWord(rBN),
		s: toWord(sBN)
	};
};

const derive = (bytes) => {
	const msgHash = soliditySha3({
		t: 'bytes',
		v: bytes
	});
	let result, computed = {
		v: 0,
		r: msgHash,
		s: msgHash
	};
	while (!result) {
		Object.assign(computed, helper(computed.r, computed.s));
		try {
			result = bufferToHex(publicToAddress(ecrecover(toBuffer(msgHash), computed.v, toBuffer(computed.r), toBuffer(computed.s))));
		} catch (e) {
			console.error(e.stack);
		}
	}
	return {
		signer: result,
		signature: computed
  };
};

module.exports = derive;
