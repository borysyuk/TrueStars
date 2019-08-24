import BlockchainService from "./BlockchainService";
import AppStorageService from "./AppStorageService";

class MarketOwnerService extends BlockchainService {

    newEntity() {
        return {
            id: 0,
            maxRate: 10,
        }
    }

    addMarketToBlockchain(market) {
        return this.sendToBlockchain(
            AppStorageService.mainContract.methods.createMarket(market.id, market.maxRate),
            {from: AppStorageService.currentAccount}
        );
    }


    addMarket(market) {
        return this.addMarketToBlockchain(market);
    }
}

export default new MarketOwnerService();