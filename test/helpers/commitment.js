const toAddress = function(input) {
    let address = input.toString()
    while (address.length < 40) {
      address = '0' + address;
    }
    return "0x"+address.slice(0, 40);
}

const hexToBuffer = function(hex_input, length) {
    return Buffer.from(web3.utils.padLeft(hex_input, length*2).slice(2), 'hex');
}

const generateCommitment = function(rate) {
    rate = web3.utils.toHex(rate);
    let rand = web3.utils.randomHex(32);

    let commitment = web3.utils.keccak256(
        Buffer.concat([
            hexToBuffer(rate, 2),
            hexToBuffer(rand, 32)
        ])
    );
    return {
        rand: rand,
        commitment: commitment
    }
}

module.exports = {
  toAddress,
  hexToBuffer,
  generateCommitment
};
