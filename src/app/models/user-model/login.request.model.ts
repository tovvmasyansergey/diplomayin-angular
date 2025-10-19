export class LoginRequestModel {
  id?: number;
  firstname?: string;
  lastname?: string;
  email: string | undefined;
  role?: string;
  token?: string;
  phone?: string;
  profilePicture?: string;
}
