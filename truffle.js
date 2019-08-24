/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
var HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config({path: __dirname+'/.env'});

 const path = require("path");

module.exports = {

  plugins: ["truffle-security"],

    networks: {
        development: {
            host: process.env.GANACHE_HOST,
            port: process.env.GANACHE_POST,
            network_id: process.env.GANACHE_NETWORK_ID,
            gas: process.env.GANACHE_GAS,
            gasPrice: process.env.GANACHE_GAS_PRICE,
            syncServer: {
                port: process.env.SYNC_SERVER_PORT,
                websocketProvider: process.env.SYNC_SERVER_WEBSOCKET_PROVIDER
            }
        },
        live: {
            from: process.env.FROM_ADDRESS_MAINNET, // default address to use for any transaction Truffle makes during migrations
            provider: function() {
                return new HDWalletProvider(process.env.MNEMONIC_MAINNET,  process.env.SYNC_SERVER_MAINNET_HTTP_PROVIDER);
            },
            network_id: 1,
            gas: 7000000, // Gas limit used for deploys
            syncServer: {
                port: process.env.SYNC_SERVER_PORT_MAINNET,
                websocketProvider: process.env.SYNC_SERVER_MAINNET_WEBSOCKET_PROVIDER
            }
        },
        ropsten: {
            from: process.env.FROM_ADDRESS_ROPSTEN, // default address to use for any transaction Truffle makes during migrations
            provider: function() {
              return new HDWalletProvider(process.env.MNEMONIC_RINKEBY, process.env.SYNC_SERVER_ROPSTEN_HTTP_PROVIDER);
            },
            network_id: '3',
            syncServer: {
                port: process.env.SYNC_SERVER_PORT_ROPSTEN,
                websocketProvider: process.env.SYNC_SERVER_ROPSTEN_WEBSOCKET_PROVIDER
            }
        },
        rinkeby: {
            from: process.env.FROM_ADDRESS_RINKEBY, // default address to use for any transaction Truffle makes during migrations
            provider: function() {
              return new HDWalletProvider(process.env.MNEMONIC_RINKEBY, process.env.SYNC_SERVER_RINKEBY_HTTP_PROVIDER);
            },
            network_id: 4,
            gas: 6900000, // Gas limit used for deploys
            syncServer: {
                port: process.env.SYNC_SERVER_PORT_RINKEBY,
                websocketProvider: process.env.SYNC_SERVER_RINKEBY_WEBSOCKET_PROVIDER
            }
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
            gas: 0xfffffffffff, // <-- Use this high gas value
            gasPrice: 0x01      // <-- Use this low gas price
        },
    },
    mocha: {
        reporter: 'eth-gas-reporter',
        reporterOptions : {
            gasPrice: 10
        }
    },

    compilers: {
        solc: {
            version: "v0.5.7+commit.6da8b019.Emscripten.clang",
            settings: {
                optimizer: {
                    enabled: true, // Default: false
                    runs: 200     // Default: 200
                },
                evmVersion: "petersburg"
            }
        },
    },

  contracts_build_directory: path.join(__dirname, "client/src/contracts")
};
