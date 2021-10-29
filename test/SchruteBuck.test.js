const SchruteBuck = artifacts.require("SchruteBuck");

let tokenInstance;

beforeEach(async () => {
  tokenInstance = await SchruteBuck.deployed();
});

contract("SchruteBuck", async (accounts) => {
  it("Set Token Name, Symbol and Standard", async () => {
    const name = await tokenInstance.name();
    const symbol = await tokenInstance.symbol();
    const standard = await tokenInstance.standard();
    assert(name, "SchruteBuck", "Token has correct name");
    assert(symbol, "SBUCK", "Token has correct symbol");
    assert(standard, "SchruteBuck V1.0", "Token has correct standard");
  });

  it("Sets the total supply", async () => {
    const totalSupply = await tokenInstance.totalSupply();
    assert.equal(
      totalSupply.toNumber(),
      10000000000,
      "Sets the total supply to 1,000,000"
    );
  });

  it("allocate initial supply", async () => {
    const adminBalance = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(
      adminBalance.toNumber(),
      10000000000,
      "Allocate total supply to admin"
    );
  });

  it("Transfer tokens", async () => {
    try {
      await tokenInstance.transfer.call(accounts[1], 99999999999999);
      assert.fail();
    } catch (error) {
      assert(error.message.indexOf("revert") >= 0, "error must contain revert");
    }

    const amountToTranfer = 250;

    const success = await tokenInstance.transfer.call(
      accounts[1],
      amountToTranfer,
      {
        from: accounts[0],
      }
    );
    assert.equal(success, true, "It returns true");

    const initialFromBalance = await tokenInstance.balanceOf(accounts[0]);
    const initialToBalance = await tokenInstance.balanceOf(accounts[1]);

    const receipt = await tokenInstance.transfer(accounts[1], amountToTranfer, {
      from: accounts[0],
    });

    const afterFromBalance = await tokenInstance.balanceOf(accounts[0]);
    const afterToBalance = await tokenInstance.balanceOf(accounts[1]);

    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Transfer",
      'should be the "Transfer" event'
    );
    assert.equal(
      receipt.logs[0].args._from,
      accounts[0],
      "logs the account the tokens are transferred from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      accounts[1],
      "logs the account the tokens are transferred to"
    );
    assert.equal(
      receipt.logs[0].args._value,
      amountToTranfer,
      "logs the transfer amount"
    );

    assert.equal(
      afterToBalance.toNumber() - initialToBalance.toNumber(),
      amountToTranfer,
      "Amount Credited To Address"
    );
    assert.equal(
      initialFromBalance.toNumber() - afterFromBalance.toNumber(),
      amountToTranfer,
      "Amount Debited From Address"
    );
  });

  it("Approve tokens for delegated transfer", async () => {
    const amountToTranfer = 100;
    const success = await tokenInstance.approve.call(
      accounts[1],
      amountToTranfer
    );
    assert.equal(success, true, "It returns true");

    const receipt = await tokenInstance.approve(accounts[1], amountToTranfer, {
      from: accounts[0],
    });
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Approval",
      'should be the "Approval" event'
    );
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      "logs the account the tokens are authorized by"
    );
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      "logs the account the tokens are authorized to"
    );
    assert.equal(
      receipt.logs[0].args._value,
      amountToTranfer,
      "logs the transfer amount"
    );

    const allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(
      allowance.toNumber(),
      amountToTranfer,
      "Sotes the allowance for delegated transfer"
    );
  });

  it("Handle delegated transfer", async () => {
    const initialFromBalance = 100;
    const accountToApprove = 20;
    const fromAccount = accounts[2];
    const toAccount = accounts[3];
    const spendingAccount = accounts[4];

    await tokenInstance.transfer(fromAccount, initialFromBalance, {
      from: accounts[0],
    });
    await tokenInstance.approve(spendingAccount, accountToApprove, {
      from: fromAccount,
    });
    try {
      await tokenInstance.transferFrom(fromAccount, toAccount, 99999, {
        from: spendingAccount,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "Cannot transfer larger value than balance"
      );
    }

    try {
      await tokenInstance.transferFrom(fromAccount, toAccount, 25, {
        from: spendingAccount,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "Cannot transfer larger value than approved amount"
      );
    }

    const amountToTranfer = 10;
    const success = await tokenInstance.transferFrom.call(
      fromAccount,
      toAccount,
      amountToTranfer,
      {
        from: spendingAccount,
      }
    );
    assert.equal(success, true, "");

    const receipt = await tokenInstance.transferFrom(
      fromAccount,
      toAccount,
      amountToTranfer,
      {
        from: spendingAccount,
      }
    );
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Transfer",
      'should be the "Transfer" event'
    );
    assert.equal(
      receipt.logs[0].args._from,
      fromAccount,
      "logs the account the tokens are transferred from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      toAccount,
      "logs the account the tokens are transferred to"
    );
    assert.equal(
      receipt.logs[0].args._value,
      amountToTranfer,
      "logs the transfer amount"
    );

    const fromBalance = await tokenInstance.balanceOf(fromAccount);
    assert.equal(
      fromBalance.toNumber(),
      initialFromBalance - amountToTranfer,
      "Deducts amount From Accounts"
    );
    const toBalance = await tokenInstance.balanceOf(toAccount);
    assert.equal(
      toBalance.toNumber(),
      amountToTranfer,
      "Deducts amount To Accounts"
    );

    const allowance = await tokenInstance.allowance(
      fromAccount,
      spendingAccount
    );
    assert.equal(
      allowance.toNumber(),
      accountToApprove - amountToTranfer,
      "Deducts amount from allowance"
    );
  });
});
