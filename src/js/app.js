App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 6000000000,
  tokensSold: 0,
  tokensAvailable: 700000,

  init: () => {
    console.log("App initialized...");
    return App.initWeb3();
  },

  initWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        web3.eth.sendTransaction({
          /* ... */
        });
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
    return App.initContracts();
  },

  initContracts: async () => {
    const dappTokenSale = await $.getJSON("SchruteBuckSale.json");
    App.contracts.SchruteBuckSale = TruffleContract(dappTokenSale);
    App.contracts.SchruteBuckSale.setProvider(App.web3Provider);
    App.contracts.SchruteBuckSale.deployed().then((dappTokenSale) => {
      console.log("SBUCK Token Sale Address:", dappTokenSale.address);
    });

    const dappToken = await $.getJSON("SchruteBuck.json");
    App.contracts.SchruteBuck = TruffleContract(dappToken);
    App.contracts.SchruteBuck.setProvider(App.web3Provider);
    App.contracts.SchruteBuck.deployed().then(function (dappToken) {
      console.log("SBUCK Token Address:", dappToken.address);
    });

    App.listenForEvents();
    return App.render();
  },

  // Listen for events emitted from the contract
  listenForEvents: async () => {
    const saleInstance = await App.contracts.SchruteBuckSale.deployed();
    saleInstance
      .Sell()
      .on("data", (event) => {
        console.log("event triggered", event);
        App.render();
      })
      .on("changed", (event) => {
        console.log("update event triggered", event);
        App.render();
      });
  },

  render: async () => {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load token sale contract
    const saleInstance = await App.contracts.SchruteBuckSale.deployed();
    App.tokenPrice = await saleInstance.tokenPrice();
    $(".token-price").html(web3.utils.fromWei(App.tokenPrice, "ether"));
    App.tokensSold = (await saleInstance.tokensSold()).toNumber();
    $(".tokens-sold").html(App.tokensSold);
    $(".tokens-available").html(App.tokensAvailable);

    const progressPercent =
      (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
    $("#progress").css("width", progressPercent + "%");

    // Load token contract
    const tokenInstance = await App.contracts.SchruteBuck.deployed();
    const balance = await tokenInstance.balanceOf(App.account);
    $(".sbuck-balance").html(balance.toNumber());
    App.loading = false;
    loader.hide();
    content.show();
  },

  buyTokens: async () => {
    $("#content").hide();
    $("#loader").show();
    const numberOfTokens = $("#numberOfTokens").val();
    const saleInstance = await App.contracts.SchruteBuckSale.deployed();

    try {
      const result = await saleInstance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000, // Gas limit
      });
      console.log("Tokens bought...");
    } catch (error) {
      console.log("Error on purchasing", error);
    }

    $("#loader").hide();
    $("#content").show();

    $("form").trigger("reset"); // reset number of tokens in form
    // Wait for Sell event
  },
};

$(() => {
  $(window).load(() => App.init());
});
