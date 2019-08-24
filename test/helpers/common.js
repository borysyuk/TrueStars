// const should = require('chai').should();

function toAddress(input) {
    let address = input.toString()
    while (address.length < 40) {
      address = '0' + address;
    }
    return "0x"+address.slice(0, 40);
}

module.exports = {
  toAddress,
};
