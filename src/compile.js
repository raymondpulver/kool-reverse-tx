'use strict';

const easySolc = require('easy-solc');

(async () => {
	const out = await easySolc('Example', require('fs').readFileSync(require('path').join(__dirname, 'Example.sol'), 'utf8'));
	console.log(out.bytecode);
})().catch((err) => {
	console.error(err.stack);
	err.errors.forEach((v) => console.error(v.formattedMessage));
});
