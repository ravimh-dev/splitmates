import apiClient from "./apiClient";

export const registerUser = async ({ name, email, password }) => {
  const response = await apiClient.post("/auth/register", { name, email, password });
  return response.data.data; // Should return { user, token }
};

export const loginUser = async ({ email, password }) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data.data; // Should return { token }
};

export const getProfile = async () => {
  const response = await apiClient.get("/users/profile");
  return response.data.data; // Should return user profile
};

export const updateProfile = async ({ name, avatar_url }) => {
  const response = await apiClient.patch("/users/profile", { name, avatar_url });
  return response.data.data; // Should return updated profile
};
