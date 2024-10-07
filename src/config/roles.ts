interface RoleRights {
  [key: string]: string[];
}

const Permissions = {
  READ_USERS: "getUsers",
  MANAGE_USERS: "manageUsers",
  MANAGE_SETTINGS: "manageSettings",
  SYSTEM_MAINTENANCE: "systemMaintenance",
  READ_BLOGS: "getBlogs",
  MANAGE_BLOGS: "manageBlogs",
};

const allRoles: RoleRights = {
  user: [],
  admin: [
    Permissions.READ_USERS,
    Permissions.MANAGE_USERS,
    Permissions.READ_BLOGS,
    Permissions.MANAGE_BLOGS,
    
  ],
  super_admin: [
    Permissions.READ_USERS,
    Permissions.MANAGE_USERS,
    Permissions.MANAGE_SETTINGS,
    Permissions.SYSTEM_MAINTENANCE,
    Permissions.READ_BLOGS,
    Permissions.MANAGE_BLOGS,
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map<string, string[]>(Object.entries(allRoles));

export { roles, roleRights };
