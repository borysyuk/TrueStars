import BlockchainService from "./BlockchainService";
import AppStorageService from "./AppStorageService";


function setLocalStorageObjectItem(key, value) {
    console.log("setKey", key,value);
    if (value === undefined) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

function getLocalStorageObjectItem(key) {
    console.log("getKey", key);
    var json = localStorage.getItem(key);
    console.log(json);
    if (json === undefined) {
        return undefined;
    }
    return JSON.parse(json);
}

function generateLocalStorageGameKey(playerAddress, marketHash) {
    return "gdfF05Bxzf5" + playerAddress + marketHash;
}

const hexToBuffer = function (web3, hex_input, length) {
    return Buffer.from(web3.utils.padLeft(hex_input, length * 2).slice(2), 'hex');
}

class MarketOwnerService extends BlockchainService {

    convertMarket(solidityResult) {
        console.log("solidityResult", solidityResult);
        var info = this.newMarketInfo();
        info.id = parseInt(solidityResult[0][0], 10);
        info.maxRating = parseInt(solidityResult[0][1], 10);
        info.winRating = parseInt(solidityResult[0][2], 10);
        info.winDistance = parseInt(solidityResult[0][3], 10);
        info.stake = parseInt(solidityResult[0][4], 10);
        info.phase = parseInt(solidityResult[0][5], 10);
        info.totalVotes = parseInt(solidityResult[0][6], 10);

        info.totalWeights = parseInt(solidityResult[0][7], 10);
        info.totalWithdraw = parseInt(solidityResult[0][8], 10);
        info.totalWinWeight = parseInt(solidityResult[0][9], 10);

        info.hash = solidityResult[1];
        info.owner = solidityResult[2];

        return info;
    }

    newEntity() {
        return {
            id: 1,
            maxRating: 10,
            stake: 0,
        }
    }

    newMarketInfo() {
        return {
            id: 0,
            maxRating: 0,
            winRating: 0,
            winDistance: 0,
            stake: 0,
            owner: "",
            phase: 0,
            totalVotes: 0,
            totalWeights: 0,
            totalWithdraw: 0,
            totalWinWeight: 0
        }
    }

    newPlayer() {
        return {
            address: "",
            weight: 100,
        }
    }

    newCommitment() {
        return {
            rate: 1,
            salt: "",
            commitment: ""
        }
    }

    addMarketToBlockchain(market) {
        //return AppStorageService.mainContract.methods.createMarket().send({from: AppStorageService.currentAccount});
        return this.sendToBlockchain(
            AppStorageService.mainContract.methods.createMarket(
                market.id,
                market.maxRating
            ),
            {from: AppStorageService.currentAccount, value: AppStorageService.web3.utils.toWei(market.stake, 'ether')}
        );
    }


    addMarket(market) {
        console.log('test add market', market);
        return this.addMarketToBlockchain(market);
    }

    addPlayerToMarketToBlockchain(id, playerAddress, playerWeight) {
        return this.computeHash(id).then(hash => {
            return this.sendToBlockchain(
                AppStorageService.mainContract.methods.registerPlayer(
                    hash,
                    playerAddress,
                    playerWeight
                ),
                {from: AppStorageService.currentAccount}
            );
        });
    }

    addPlayerToMarket(id, playerAddress, playerWeight) {
        console.log('test addPlayerToMarket', id, playerAddress, playerWeight);
        return this.addPlayerToMarketToBlockchain(id, playerAddress, playerWeight);
    }

    computeHash(id) {
        console.log('AppStorageService.currentAccount', AppStorageService.currentAccount);
        return AppStorageService.mainContract.methods.computeId(
            parseInt(id, 10),
            AppStorageService.currentAccount
        ).call({from: AppStorageService.currentAccount});
    }

    getMarketByHash(hash) {
        return AppStorageService.mainContract.methods.getMarket(hash).call({from: AppStorageService.currentAccount}).then(result => {
            console.log("getMarket", result);
            return this.convertMarket(result);
        }).catch(error => {
            console.log('getMarketERROR! ', error);
        })
    }

    getMarket(id) {
        console.log("id = ", id);
        return this.computeHash(id).then(hash => {
            console.log("hash", hash);
            return this.getMarketByHash(hash);
        })

    }

    switchToReveal(id) {
        return this.computeHash(id).then(hash => {
            this.sendToBlockchain(
                AppStorageService.mainContract.methods.startReveal(hash),
                {from: AppStorageService.currentAccount}
            );
        });
    }

    switchToWithdraw(id) {
        return this.computeHash(id).then(hash => {
            this.sendToBlockchain(
                AppStorageService.mainContract.methods.startWithdraw(hash),
                {from: AppStorageService.currentAccount}
            );
        });
    }

    switchToDestroy(id) {
        return this.computeHash(id).then(hash => {
            this.sendToBlockchain(
                AppStorageService.mainContract.methods.destroyMarket(hash),
                {from: AppStorageService.currentAccount}
            );
        });
    }

    commit(marketHash, commitment) {
        return this.sendToBlockchain(
            AppStorageService.mainContract.methods.commit(marketHash, commitment),
            {from: AppStorageService.currentAccount}
        );
    }

    reveal(marketHash, rate, salt) {
        return this.sendToBlockchain(
            AppStorageService.mainContract.methods.reveal(marketHash, rate, salt),
            {from: AppStorageService.currentAccount}
        );
    }

    withdraw(marketHash) {
        return this.sendToBlockchain(
            AppStorageService.mainContract.methods.withdraw(marketHash),
            {from: AppStorageService.currentAccount}
        );
    }

    generateCommitment(rate) {
        rate = AppStorageService.web3.utils.toHex(rate);
        let rand = AppStorageService.web3.utils.randomHex(32);

        let commitment = AppStorageService.web3.utils.keccak256(
            Buffer.concat([
                hexToBuffer(AppStorageService.web3, rate, 2),
                hexToBuffer(AppStorageService.web3, rand, 32)
            ])
        );
        return {
            rand: rand,
            commitment: commitment
        }
    }

    saveCommitmentToLocalStorage(playerAddress, marketHash, rate, commitment, salt) {
        setLocalStorageObjectItem(
            generateLocalStorageGameKey(playerAddress, marketHash),
            {rate: rate, commitment: commitment, salt: salt});
    }

    loadCommitmentFromLocalStorage(playerAddress, marketHash) {
        var result = getLocalStorageObjectItem(generateLocalStorageGameKey(playerAddress, marketHash));
        if (!result) {
            result = this.newCommitment();
        }
        return result;
    }
}

export default new MarketOwnerService();