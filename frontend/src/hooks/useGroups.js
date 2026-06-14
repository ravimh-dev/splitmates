import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listGroups, getGroupDetails, createGroup, joinGroup } from "../api/groups";

export const useGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });
};

export const useGroupDetails = (groupId) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};
