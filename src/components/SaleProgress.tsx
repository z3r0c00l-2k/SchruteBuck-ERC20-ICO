import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const SaleProgress = () => {
  const { address, tokenSold, tokensAvailable } = useContext(AppContext);

  return (
    <div>
      <div className='progress'>
        <div
          id='progress'
          className='progress-bar progress-bar-striped active'
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            width: `${(Math.ceil(tokenSold) / tokensAvailable) * 100}%`,
          }}
        />
      </div>
      <p>
        <span className='tokens-sold'>{tokenSold}</span> /{' '}
        <span className='tokens-available'>{tokensAvailable}</span> SBUCKs sold
      </p>
      <hr />
      <p className='text-center'>Your Address : {address}</p>
    </div>
  );
};

export default SaleProgress;
