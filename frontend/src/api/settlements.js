import apiClient from "./apiClient";

export const simplifyDebts = async (groupId) => {
  const response = await apiClient.get(`/settlements/${groupId}/simplify`);
  return response.data.data; // Returns { transfers: [...] }
};

export const getGroupSettlements = async (groupId) => {
  const response = await apiClient.get(`/settlements/groups/${groupId}`);
  return response.data.data;
};

export const createSettlement = async ({ groupId, fromUserId, toUserId, amount }) => {
  const response = await apiClient.post("/settlements", {
    group_id: groupId,
    from_user_id: fromUserId,
    to_user_id: toUserId,
    amount,
  });
  return response.data.data;
};

export const paySettlement = async (settlementId) => {
  const response = await apiClient.patch(`/settlements/${settlementId}/pay`);
  return response.data.data;
};
