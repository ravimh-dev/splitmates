import { useQuery } from "@tanstack/react-query";
import { getMyBalances, getGroupBalances } from "../api/balances";

export const useMyBalances = () => {
  return useQuery({
    queryKey: ["my-balances"],
    queryFn: getMyBalances,
  });
};

export const useGroupBalances = (groupId) => {
  return useQuery({
    queryKey: ["balances", groupId],
    queryFn: () => getGroupBalances(groupId),
    enabled: !!groupId,
  });
};
