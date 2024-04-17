interface RoleRights {
  [key: string]: string[];
}

const allRoles: RoleRights = {
  user: [],
  admin: ["getUsers", "manageUsers"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
