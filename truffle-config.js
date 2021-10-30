require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKeys = process.env.PRIVATE_KEYS || '';

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          privateKeys.split(','), // Array of account private keys
          `wss://ropsten.infura.io/ws/v3/${process.env.INFURA_API_KEY}` // Url to an Ethereum Node
        ),
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 3,
    },
  },
  contracts_directory: './contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: '0.8.6',
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
