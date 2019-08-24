class BlockchainService {

    sendToBlockchain(request, options) {
        // console.log("Request", request);
        return new Promise((resolve, reject) => {
            request.estimateGas(options).then(() => {
                request.send(options)
                .on('transactionHash', (hash) => {
                    resolve(hash);
                })
                .on('error', (error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        })
    }
}

export default BlockchainService;