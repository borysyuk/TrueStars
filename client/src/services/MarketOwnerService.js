import BlockchainService from "./BlockchainService";
import AppStorageService from "./AppStorageService";


class MarketOwnerService extends BlockchainService {


    convertMarket(solidityResult) {
        var info = this.newMarketInfo();
        info.maxRate = solidityResult[0];
        info.winRate = solidityResult[1];
        info.winDistance = solidityResult[2];
        info.stake = solidityResult[3];
        info.owner = solidityResult[4];
        info.phase = solidityResult[5];
        info.totalVotes = solidityResult[6];

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

    getMarket(id) {
        var address = AppStorageService.currentAccount;

        return AppStorageService.mainContract.getMarket(id).then(result => {
            return this.convertMarket(result);
        })
    }
}

export default new MarketOwnerService();