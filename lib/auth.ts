// Simple authentication with localStorage
export interface User {
  id: string
  email: string
  name: string
  role: "EMPLOYEE" | "SUPERVISOR" | "HR" | "DIRECTOR"
  department: string
}

export const demoUsers: User[] = [
  {
    id: "1",
    email: "employee@adpa.com",
    name: "John Employee",
    role: "EMPLOYEE",
    department: "IT",
  },
  {
    id: "2",
    email: "supervisor@adpa.com",
    name: "Jane Supervisor",
    role: "SUPERVISOR",
    department: "IT",
  },
  {
    id: "3",
    email: "hr@adpa.com",
    name: "HR Manager",
    role: "HR",
    department: "HR",
  },
  {
    id: "4",
    email: "director@adpa.com",
    name: "Executive Director",
    role: "DIRECTOR",
    department: "EXECUTIVE",
  },
]

export function validateCredentials(email: string, password: string): User | null {
  const user = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (user && password === "password") {
    return user
  }
  return null
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const userData = localStorage.getItem("currentUser")
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem("currentUser", JSON.stringify(user))
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("currentUser")
}

export function getUserById(id: string): User | null {
  return demoUsers.find((user) => user.id === id) || null
}

// Mock authOptions for compatibility with existing API routes
export const authOptions = {
  providers: [],
  callbacks: {
    session: async ({ session, token }: any) => {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.department = token.department
      }
      return session
    },
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
