const SchruteBuck = artifacts.require("SchruteBuck");
const SchruteBuckSale = artifacts.require("SchruteBuckSale");

module.exports = async (deployer) => {
  await deployer.deploy(SchruteBuck, 10000000000);

  const tokenPrice = 6000000000;
  await deployer.deploy(SchruteBuckSale, SchruteBuck.address, tokenPrice);
};
