export class LoginRequestModel {
  id?: number;
  email: string | undefined;
  password: string | undefined;
  firstname?: string;
  lastname?: string;
  phone?: string;
  profilePicture?: string;
  location?: string;
  token?: string;
}
