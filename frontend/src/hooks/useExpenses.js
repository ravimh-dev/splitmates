import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, deleteExpense } from "../api/expenses";

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: (data, variables) => {
      const groupId = variables.group_id;
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
      queryClient.invalidateQueries({ queryKey: ["activities", groupId] });
      queryClient.invalidateQueries({ queryKey: ["my-balances"] });
      queryClient.invalidateQueries({ queryKey: ["debts-simplify", groupId] });
      queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: (data, variables) => {
      // variables here is just expenseId, but we return the deleted expense from API containing group_id
      if (data && data.group_id) {
        const groupId = data.group_id;
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
        queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
        queryClient.invalidateQueries({ queryKey: ["activities", groupId] });
        queryClient.invalidateQueries({ queryKey: ["my-balances"] });
        queryClient.invalidateQueries({ queryKey: ["debts-simplify", groupId] });
        queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
      }
    },
  });
};
