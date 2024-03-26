export type Message = {
  type?: 'success' | 'error' | 'info' | 'warning';
  header: string;
  message: string;
};
