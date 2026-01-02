import { Router, Route } from "@solidjs/router";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient } from "./lib/query";
import { authStore } from "./features/auth/auth.store";
import { onMount } from "solid-js";

import Layout from "./components/Layout";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import PurchaseCancel from "./pages/PurchaseCancel";

export default function App() {
  onMount(() => {
    authStore.check();
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router root={Layout}>
        <Route path="/" component={Shop} />
        <Route path="/products/:id" component={ProductDetails} />
        <Route path="/profile" component={Profile} />
        <Route path="/purchases/success" component={PurchaseSuccess} />
        <Route path="/purchases/cancel" component={PurchaseCancel} />
        <Route path="/admin" component={() => (
          <AdminRoute>
            <Admin />
          </AdminRoute>
        )} />
        <Route path="*404" component={NotFound} />
      </Router>
    </QueryClientProvider>
  );
}