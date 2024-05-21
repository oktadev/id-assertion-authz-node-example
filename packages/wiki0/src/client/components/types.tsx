export interface IPage {
  id: number;
  title: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  content: string;
}
