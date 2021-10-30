import Header from '../components/Header';
import SaleForm from '../components/SaleForm';
import SaleProgress from '../components/SaleProgress';

const HomePage = () => {
  return (
    <div className='container' style={{ width: '650px' }}>
      <div>
        <Header />
        <br />
        <SaleForm />
        <br />
        <SaleProgress />
      </div>
    </div>
  );
};

export default HomePage;
