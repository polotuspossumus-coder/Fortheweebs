export const notifyUser = async (userId: string, message: string) => {
  await fetch('/api/notify', {
    method: 'POST',
    body: JSON.stringify({ userId, message }),
  });
};
