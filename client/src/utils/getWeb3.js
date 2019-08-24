import Web3 from "web3";
// import Fortmatic from 'fortmatic';
// const fm = new Fortmatic('pk_test_221EAA1E98DB6F4E');

const getWeb3 = () =>
    new Promise((resolve, reject) => {
        // Wait for loading completion to avoid race conditions with web3 injection timing.
        window.addEventListener("load", async () => {
            // Modern dapp browsers...
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                try {
                    // Request account access if needed
                    await window.ethereum.enable();
                    // Acccounts now exposed
                    resolve(web3);
                } catch (error) {
                    reject(error);
                }
            } else {
                // window.web3 = new Web3(fm.getProvider());
                // const web3 = window.web3;
                // resolve(web3);
                if (window.web3) {
                    // Legacy dapp browsers...
                    // Use Mist/MetaMask's provider.
                    const web3 = window.web3;
                    console.log("Injected web3 detected.");
                    resolve(web3);
                } else {
                    reject('Web3 not found!');
                }
            }
        });
    });

export default getWeb3;
