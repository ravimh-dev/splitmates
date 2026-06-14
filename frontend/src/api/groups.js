import apiClient from "./apiClient";

export const createGroup = async ({ name }) => {
  const response = await apiClient.post("/groups", { name });
  return response.data.data;
};

export const listGroups = async () => {
  const response = await apiClient.get("/groups");
  return response.data.data;
};

export const getGroupDetails = async (groupId) => {
  const response = await apiClient.get(`/groups/${groupId}`);
  return response.data.data;
};

export const joinGroup = async ({ joinCode }) => {
  const response = await apiClient.post("/groups/join", { join_code: joinCode });
  return response.data.data;
};

export const exportGroupStatement = async (groupId) => {
  const response = await apiClient.get(`/groups/${groupId}/export?format=csv`, {
    responseType: "blob",
  });
  return response.data;
};
