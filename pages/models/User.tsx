export class User {
  userId: string
  firstName: string
  lastName: string
  email: string

  constructor(
    userId: string,
    firstName: string,
    lastName: string,
    email: string
  ) {
    this.userId = userId
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
  }
}
