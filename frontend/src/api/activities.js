import apiClient from "./apiClient";

export const getGroupActivities = async (groupId, params = {}) => {
  const response = await apiClient.get(`/activities/groups/${groupId}`, { params });
  return response.data.data;
};
