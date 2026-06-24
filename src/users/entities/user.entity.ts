export class User {
  id!: number;
  email!: string;
  username?: string;
  passwordHash!: string;
  createdAt?: Date;
  updatedAt?: Date;
}
