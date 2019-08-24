import BlockchainService from "./BlockchainService";
import AppStorageService from "./AppStorageService";


class MarketOwnerService extends BlockchainService {


    convertMarket(solidityResult) {
        console.log("solidityResult", solidityResult);
        var info = this.newMarketInfo();
        info.maxRate = parseInt(solidityResult[0], 10);
        info.winRate = parseInt(solidityResult[1], 10);
        info.winDistance = parseInt(solidityResult[2], 10);
        info.stake = parseInt(solidityResult[3],10);
        info.owner = solidityResult[4];
        info.phase = parseInt(solidityResult[5], 10);
        info.totalVotes = parseInt(solidityResult[6], 10);

        return info;
    }

    newEntity() {
        return {
            id: 1,
            maxRate: 10,
        }
    }

    newMarketInfo() {
        return {
            maxRate: 0,
            winRate: 0,
            winDistance: 0,
            stake: 0,
            owner: "",
            phase: 0,
            totalVotes: 0
        }
    }

    addMarketToBlockchain(market) {
        //return AppStorageService.mainContract.methods.createMarket().send({from: AppStorageService.currentAccount});
        return this.sendToBlockchain(
            AppStorageService.mainContract.methods.createMarket(
                market.id,
                market.maxRate
            ),
            {from: AppStorageService.currentAccount}
        );
    }


    addMarket(market) {
        console.log('test add market', market);
        return this.addMarketToBlockchain(market);
    }

    computeHash(id) {
        console.log('AppStorageService.currentAccount', AppStorageService.currentAccount);
        return AppStorageService.mainContract.methods.computeId(parseInt(id, 10), AppStorageService.currentAccount).call({from: AppStorageService.currentAccount});
    }

    getMarket(id) {
        console.log("id = ", id);
        console.log("this", this.computeHash);
        return this.computeHash(id).then(hash => {
            console.log("hash", hash);
            return AppStorageService.mainContract.methods.getMarket(hash).call({from: AppStorageService.currentAccount}).then(result => {
                return this.convertMarket(result);
            }).catch(console.log)
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

    }

    switchToDestroy(id) {

    }
}

export default new MarketOwnerService();