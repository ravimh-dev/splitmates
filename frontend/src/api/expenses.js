import apiClient from "./apiClient";

export const createExpense = async (expenseData) => {
  // expenseData structure: { group_id, paid_by, amount, split_type, title, description, splits: [...] }
  const response = await apiClient.post("/expenses", expenseData);
  return response.data.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await apiClient.delete(`/expenses/${expenseId}`);
  return response.data.data;
};
