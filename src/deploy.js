'use strict';

const abi = require('web3-eth-abi');
const rpcCall = require('kool-makerpccall');
const call = (method, params = []) => rpcCall('http://localhost:8545', method, params);
const fs = require('fs');
const path = require('path');

(async () => {
	const [ from ] = await call('eth_accounts');
	const tx = await call('eth_sendTransaction', [{
		from,
		data: fs.readFileSync(path.join(__dirname, 'Test.evm'), 'utf8').trim(),
	  gasPrice: '0x1',
		gas: 6e6
	}]);
	const {
		contractAddress,
		logs
	} = await call('eth_getTransactionReceipt', [ tx ]);
	console.log(logs);
	/*
	console.log(await call('eth_getCode', [ contractAddress ]));
  console.log((await call('eth_call', [{
		to: contractAddress,
		/*
		from,
		gasPrice: '0x1',
		gas: 6e6,
		data: abi.encodeFunctionCall({
			name: 'check',
			inputs: []
			/*
				name: 'i',
				type: 'uint256'
			}]
		},  [])
	}])));
*/
})().catch((err) => console.error(err.stack));
