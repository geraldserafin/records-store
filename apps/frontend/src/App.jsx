import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import Shop from './pages/Shop';
import RecordDetails from './pages/RecordDetails';
import OrderDetails from './pages/OrderDetails';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <Route path="/admin" component={Admin} />
      <Route path="/" component={Layout}>
        <Route path="/" component={Shop} />
        <Route path="/genre/:genre" component={Shop} />
        <Route path="/section/:section" component={Shop} />
        <Route path="/search" component={Shop} />
        <Route path="/record/:id" component={RecordDetails} />
        <Route path="/order/:id" component={OrderDetails} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/purchases/success" component={Success} />
        <Route path="/purchases/cancel" component={Cancel} />
      </Route>
    </Router>
  );
}
