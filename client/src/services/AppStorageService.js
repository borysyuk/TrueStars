class AppStorageService {

    constructor (){
        this.web3 = null;
        this.mainContract = null;
        this.currentAccount = null;
        this.backendURL = null;
    }

    set(key, value) {
        this[key] = value;
    }
}

export default new AppStorageService();