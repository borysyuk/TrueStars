import BlockchainService from "./BlockchainService";
import AppStorageService from "./AppStorageService";

class MarketOwnerService extends BlockchainService {

    newEntity() {
        return {
            id: 1,
            maxRate: 10,
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
}

export default new MarketOwnerService();