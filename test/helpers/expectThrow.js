module.exports.errTypes = {
    revert            : "revert",
    outOfGas          : "out of gas",
    invalidJump       : "invalid JUMP",
    invalidOpcode     : "invalid opcode",
    stackOverflow     : "stack overflow",
    stackUnderflow    : "stack underflow",
    staticStateChange : "static state change"
};

module.exports.expectThrow = async function(promise, errType, message) {
    const PREFIX = "Returned error: VM Exception while processing transaction: ";
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one: " + message);
        assert(
            error.message.startsWith(PREFIX + errType + (message ? " " + message : "")),
            "Expected an error starting with '" +
            PREFIX +
            errType +
            (message ? " " + message : "") +
            "' but got '" +
            error.message +
            "' instead"
        );
    }
};
