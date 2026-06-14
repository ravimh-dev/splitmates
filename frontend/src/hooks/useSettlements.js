import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  simplifyDebts,
  getGroupSettlements,
  createSettlement,
  paySettlement,
} from "../api/settlements";

export const useSimplifyDebts = (groupId) => {
  return useQuery({
    queryKey: ["debts-simplify", groupId],
    queryFn: () => simplifyDebts(groupId),
    enabled: !!groupId,
  });
};

export const useGroupSettlements = (groupId) => {
  return useQuery({
    queryKey: ["settlements", groupId],
    queryFn: () => getGroupSettlements(groupId),
    enabled: !!groupId,
  });
};

export const useCreateSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSettlement,
    onSuccess: (data, variables) => {
      const groupId = variables.groupId;
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
      queryClient.invalidateQueries({ queryKey: ["activities", groupId] });
      queryClient.invalidateQueries({ queryKey: ["my-balances"] });
      queryClient.invalidateQueries({ queryKey: ["debts-simplify", groupId] });
      queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
    },
  });
};

export const usePaySettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paySettlement,
    onSuccess: (data) => {
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
