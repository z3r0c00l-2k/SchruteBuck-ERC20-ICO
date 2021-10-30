import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const Header = () => {
  const {
    isLoading,
    tokenPrice,
    balance,
    availableNetworks,
    icoContractAddress,
    tokenContractAddress,
    network,
  } = useContext(AppContext);

  return (
    <div className='row'>
      <div className='col-lg-12'>
        <h1 className='text-center'>SBUCK TOKEN ICO SALE</h1>
        <hr />
        <br />
      </div>
      <div className='text-center mb-2'>
        Available Networks :{' '}
        <span className='fw-bold'>{availableNetworks.join(', ')}</span>
      </div>
      <div className='text-center mb-2'>
        Connected Network :{' '}
        <span className='fw-bold text-capitalize'>{network}</span>
      </div>
      <div className='text-center mb-2 d-flex align-items-center'>
        SBUCK Token Contract Address :{' '}
        <code className='fw-bold'>{tokenContractAddress}</code>
      </div>
      <div className='text-center mb-2 d-flex align-items-center'>
        SBUCK ICO Contract Address :{' '}
        <code className='fw-bold'>{icoContractAddress}</code>
      </div>
      {isLoading ? (
        <div id='loader'>
          <p className='text-center'>Loading...</p>
        </div>
      ) : (
        <div className='text-center'>
          <p>
            Introducing "SchruteBuck" (SBUCK)! Token price is{' '}
            <span className='fw-bold'>{tokenPrice?.toString()}</span> ETH. You
            currently have <span className='fw-bold'>{balance}</span>
            &nbsp;SBUCK.
          </p>
          <img
            className='img-fluid'
            src={require('../assets/images/SchruteBuck.jpeg').default}
            alt=''
          />
        </div>
      )}
    </div>
  );
};

export default Header;
