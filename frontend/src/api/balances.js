import apiClient from "./apiClient";

export const getGroupBalances = async (groupId) => {
  const response = await apiClient.get(`/balances/groups/${groupId}`);
  return response.data.data;
};

export const getMyBalances = async () => {
  const response = await apiClient.get("/balances/me");
  return response.data.data;
};
