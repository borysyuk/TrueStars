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

module.exports = {
  toAddress,
  hexToBuffer
};
