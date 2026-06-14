export const generateResponseJSON = <T = any>(
  status: number,
  message: string,
  data?: T,
) => {
  return { status, success: status >= 200 && status < 300, message, data };
};
