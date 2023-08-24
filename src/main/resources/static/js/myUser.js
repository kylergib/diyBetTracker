export class MyUser {
  constructor(id, name, email, roles) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.roles = roles;
  }
}
export function createUser(userJson) {
  return new MyUser(userJson.id, userJson.name, userJson.email, userJson.roles);
}
