import { createResource, createRoot } from "solid-js";
import api from "./api";

function createUserStore() {
  const fetchUser = async () => {
    try {
      return await api.get("users/me").json();
    } catch (e) {
      return null;
    }
  };

  const fetchOrders = async (user) => {
    if (!user) return [];
    return await api.get("purchases/orders").json();
  };

  const [user, { mutate: mutateUser, refetch: refetchUser }] = createResource(fetchUser);
  const [orders, { mutate: mutateOrders, refetch: refetchOrders }] = createResource(user, fetchOrders);

  return { 
    user, 
    mutateUser, 
    refetchUser, 
    orders, 
    mutateOrders, 
    refetchOrders 
  };
}

export default createRoot(createUserStore);
