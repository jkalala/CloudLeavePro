declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "EMPLOYEE" | "SUPERVISOR" | "HR" | "DIRECTOR"
      department: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: "EMPLOYEE" | "SUPERVISOR" | "HR" | "DIRECTOR"
    department: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "EMPLOYEE" | "SUPERVISOR" | "HR" | "DIRECTOR"
    department: string
  }
}
