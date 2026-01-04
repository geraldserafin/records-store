import { Router, Route } from "@solidjs/router";
import Layout from "./components/Layout";
import Shop from "./pages/Shop";
import GenrePage from "./pages/GenrePage";
import ArtistDetails from "./pages/ArtistDetails";
import RecordDetails from "./pages/RecordDetails";
import Profile from "./pages/Profile";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import AdminLayout from "./admin/AdminLayout";
import DashboardPage from "./admin/pages/DashboardPage";
import ArtistsPage from "./admin/pages/ArtistsPage";
import GenresPage from "./admin/pages/GenresPage";
import RecordsPage from "./admin/pages/RecordsPage";

export default function App() {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route path="/" component={Shop} />
        <Route path="/genres/:genre" component={GenrePage} />
        <Route path="/search" component={Shop} />
        <Route path="/record/:id" component={RecordDetails} />
        <Route path="/artists/:slug" component={ArtistDetails} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile/:id" component={Profile} />
        <Route path="/order/:id" component={OrderDetails} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/purchases/success" component={Success} />
        <Route path="/purchases/cancel" component={Cancel} />
      </Route>

      <Route path="/admin" component={AdminLayout}>
        <Route path="/" component={DashboardPage} />
        <Route path="/artists" component={ArtistsPage} />
        <Route path="/genres" component={GenresPage} />
        <Route path="/records" component={RecordsPage} />
      </Route>
    </Router>
  );
}
