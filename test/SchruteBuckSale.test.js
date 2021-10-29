const SchruteBuckSale = artifacts.require("SchruteBuckSale");
const SchruteBuck = artifacts.require("SchruteBuck");

let tokenSaleInstance;
let tokenInstance;
const tokenPrice = 6000000000; // in wei

beforeEach(async () => {
  tokenInstance = await SchruteBuck.deployed();
  tokenSaleInstance = await SchruteBuckSale.deployed();
});

contract("SchruteBuckSale", (accounts) => {
  const buyer = accounts[1];
  const admin = accounts[0];
  const tokenAvailble = 700000;
  const noOfTokens = 10;

  it("Initializes with contract", async () => {
    const address = await tokenSaleInstance.address;
    assert.notEqual(address, 0x0, "has correct address");

    const tokenContract = await tokenSaleInstance.tokenContract();
    assert.notEqual(tokenContract, 0x0, "has contract address");

    const price = await tokenSaleInstance.tokenPrice();
    assert.equal(price, tokenPrice, "has correct price");
  });

  it("Token Buying", async () => {
    await tokenInstance.transfer(tokenSaleInstance.address, tokenAvailble, {
      from: admin,
    });

    const receipt = await tokenSaleInstance.buyTokens(noOfTokens, {
      from: buyer,
      value: noOfTokens * tokenPrice,
    });

    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(receipt.logs[0].event, "Sell", 'should be the "Sell" event');
    assert.equal(
      receipt.logs[0].args._buyer,
      buyer,
      "logs the account thet purchased the tokens"
    );
    assert.equal(
      receipt.logs[0].args._amount,
      noOfTokens,
      "logs the number of tokens purchased"
    );

    const amount = await tokenSaleInstance.tokensSold();
    assert.equal(amount.toNumber(), noOfTokens, "Increment no of token sold");

    const buyerBalance = await tokenInstance.balanceOf(buyer);
    assert.equal(
      buyerBalance.toNumber(),
      noOfTokens,
      "Tests if tokens credited to buyer"
    );
    const adminBalance = await tokenInstance.balanceOf(
      tokenSaleInstance.address
    );
    assert.equal(
      adminBalance.toNumber(),
      tokenAvailble - noOfTokens,
      "Tests if token debited from admin account"
    );

    try {
      await tokenSaleInstance.buyTokens(noOfTokens, {
        from: buyer,
        value: 1,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "msg.value must equal number of tokens in wei"
      );
    }

    try {
      await tokenSaleInstance.buyTokens(800000, {
        from: buyer,
        value: noOfTokens * tokenPrice,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "Cannot purchase more tokens the available"
      );
    }
  });

  it("Ends token sale", async () => {
    try {
      await tokenSaleInstance.endSale({
        from: buyer,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "Admin can only end the sale"
      );
    }

    await tokenSaleInstance.endSale({
      from: admin,
    });
    const totalSupply = await tokenInstance.totalSupply();
    const adminBalance = await tokenInstance.balanceOf(admin);
    assert.equal(
      adminBalance.toNumber(),
      totalSupply - noOfTokens,
      "Returns all unsold tokens"
    );

    const balance = await web3.eth.getBalance(tokenSaleInstance.address);
    assert.equal(balance, 0);
  });
});
