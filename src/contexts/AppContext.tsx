import { createContext, FC, useEffect, useRef, useState } from 'react';
import useWeb3 from '../hooks/web3Hook';
import TokenSaleContract from '../abis/SchruteBuckSale.json';
import TokenContract from '../abis/SchruteBuck.json';
import { Contract } from 'web3-eth-contract';

type ContextType = {
  address: string;
  isLoading: boolean;
  tokenSold: number;
  tokensAvailable: number;
  balanceTokens: number;
  availableNetworks: string[];
  tokenPrice: string | undefined;
  balance: number;
  buyTokens: (
    numberOfTokens: number,
    callback?: (isSuccess: boolean, payload: any) => void
  ) => void;
  icoContractAddress: string;
  tokenContractAddress: string;
  explorerUrl: string;
  network: string;
};

const AppContext = createContext({} as ContextType);

const AppContextProvider: FC = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenSold, setTokenSold] = useState(0);
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);
  const [balance, setBalance] = useState(0);
  const [tokenPrice, setTokenPrice] = useState('0');
  const [tokenPriceInWei, setTokenPriceInWei] = useState(0);
  const [balanceTokens, setBalanceTokens] = useState(0);

  const saleContractRef = useRef<Contract | null>(null);
  const tokenContractRef = useRef<Contract | null>(null);
  const icoContractAddressRef = useRef('0x0');
  const tokenContractAddressRef = useRef('0x0');

  const { accounts, address, explorerUrl, isWeb3, network, web3, networkId } =
    useWeb3();

  useEffect(() => {
    if (isWeb3 && web3) {
      getDeployedNetworks();

      const saleNetworkData = (TokenSaleContract.networks as any)[networkId!];
      if (saleNetworkData) {
        // Assign contract
        const saleContract = new web3.eth.Contract(
          TokenSaleContract.abi as any,
          saleNetworkData.address
        );
        icoContractAddressRef.current = saleNetworkData.address;
        saleContractRef.current = saleContract;
        // setupEventListeners(saleContract);
      } else {
        alert('TokenSaleContract contract not deployed to detected network.');
      }

      const tokenNetworkData = (TokenContract.networks as any)[networkId!];
      if (tokenNetworkData) {
        // Assign contract
        const tokenContract = new web3.eth.Contract(
          TokenContract.abi as any,
          tokenNetworkData.address
        );
        tokenContractAddressRef.current = tokenNetworkData.address;
        tokenContractRef.current = tokenContract;
        // setupEventListeners(saleContract);
      } else {
        alert('TokenSaleContract contract not deployed to detected network.');
      }
      getBlockchainData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3, accounts, web3, networkId]);

  const getDeployedNetworks = () => {
    const ethNetworks: { [key: string]: string } = {
      '1': 'Mainnet',
      '3': 'Ropsten',
      '4': 'Rinkeby',
      '5': 'Goerli',
    };
    const networkArray: string[] = [];
    for (const networkId in TokenSaleContract.networks) {
      if (ethNetworks[networkId]) {
        networkArray.push(ethNetworks[networkId]);
      }
    }
    setAvailableNetworks(networkArray);
  };

  const getBlockchainData = async () => {
    if (web3 && tokenContractRef.current && saleContractRef.current) {
      const soldTokens = await saleContractRef.current.methods
        .tokensSold()
        .call();
      setTokenSold(parseFloat(soldTokens));
      const price = await saleContractRef.current.methods.tokenPrice().call();
      setTokenPriceInWei(parseFloat(price));
      setTokenPrice(web3.utils.fromWei(price, 'ether'));

      const currentBalance = await tokenContractRef.current.methods
        .balanceOf(address)
        .call();
      setBalance(currentBalance);

      const availableTokens = await tokenContractRef.current.methods
        .balanceOf(icoContractAddressRef.current)
        .call();
      setBalanceTokens(parseFloat(availableTokens));
      setIsLoading(false);
    }
  };

  // const setupEventListeners = (contract: Contract) => {};

  const buyTokens = (
    numberOfTokens: number,
    callback?: (isSuccess: boolean, payload?: any) => void
  ) => {
    if (saleContractRef.current) {
      setIsLoading(true);
      try {
        saleContractRef.current.methods
          .buyTokens(numberOfTokens.toString())
          .send({
            from: address,
            value: numberOfTokens * tokenPriceInWei,
          })
          .on('transactionHash', (hash: any) => {
            console.log('Hash', hash);
            setIsLoading(false);
            callback && callback(true, { hash, numberOfTokens });
          })
          .on('error', (e: Error) => {
            alert('Error Executing the SmartContract');
            console.error('Error', e);
            callback && callback(false);
            setIsLoading(false);
          });
      } catch (error) {
        alert('Error on buying');
        console.error('Error on buying', error);
        setIsLoading(false);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        address,
        isLoading,
        tokenSold,
        tokensAvailable: 7000000000,
        balanceTokens,
        availableNetworks,
        tokenPrice,
        balance,
        buyTokens,
        icoContractAddress: icoContractAddressRef.current,
        tokenContractAddress: tokenContractAddressRef.current,
        explorerUrl,
        network,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContextProvider, AppContext };
