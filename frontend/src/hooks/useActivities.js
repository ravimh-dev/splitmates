import { useQuery } from "@tanstack/react-query";
import { getGroupActivities } from "../api/activities";

export const useGroupActivities = (groupId, params = {}) => {
  return useQuery({
    queryKey: ["activities", groupId, params],
    queryFn: () => getGroupActivities(groupId, params),
    enabled: !!groupId,
  });
};
