const SchruteBuck = artifacts.require('SchruteBuck');
const SchruteBuckSale = artifacts.require('SchruteBuckSale');

const TOTAL_SUPPLY = 10000000000;
const TOKEN_PRICE = 6000000000;

module.exports = async (deployer) => {
  await deployer.deploy(SchruteBuck, TOTAL_SUPPLY);

  await deployer.deploy(SchruteBuckSale, SchruteBuck.address, TOKEN_PRICE);
};
