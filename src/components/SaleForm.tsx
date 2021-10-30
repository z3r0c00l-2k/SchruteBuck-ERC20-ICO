import { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';

const SaleForm = () => {
  const { buyTokens, explorerUrl } = useContext(AppContext);

  const [formInput, setFormInput] = useState('');
  const [txnLink, setTxnLink] = useState('');

  const callback = (isSuccess: boolean, payload: any) => {
    if (isSuccess) {
      setFormInput('');
      setTxnLink(`${explorerUrl}/tx/${payload.hash}`);
      setTimeout(() => setTxnLink(''), 15000);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        buyTokens(parseFloat(formInput), callback);
      }}
      className='d-flex flex-column'
    >
      <div className='form-group'>
        <div className='input-group'>
          <input
            id='numberOfTokens'
            className='form-control input-lg'
            type='number'
            name='number'
            min={1}
            pattern='[0-9]'
            value={formInput}
            onChange={(e) => setFormInput(e.target.value)}
            required
          />
          <span className='input-group-btn'>
            <button type='submit' className='btn btn-primary btn-lg'>
              Buy SBUCK
            </button>
          </span>
        </div>
      </div>
      {txnLink && (
        <a
          href={txnLink}
          target='_blank'
          rel='noopener noreferrer'
          className='btn btn-link text-center mt-2'
        >
          Tnx Link
        </a>
      )}
    </form>
  );
};

export default SaleForm;
