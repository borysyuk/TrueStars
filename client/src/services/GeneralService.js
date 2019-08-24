import AppStorageService from "./AppStorageService";

class GeneralService {

    getWeb3ErrorText(error) {
        var result = '';
        var pos = error.indexOf('} ');
        if (pos >= 0){
            result = error.substr(pos+2, error.length - pos+1);
        }
        return result;
    }

    getCurrentAccount() {
        return new Promise((resolve, reject) => {
            AppStorageService.web3.eth.getAccounts((error, accounts) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(accounts[0]);
            })
        });
    }
}

export default new GeneralService();
