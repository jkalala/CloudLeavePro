export type Language = "en" | "pt" | "fr"

export interface Translations {
  // Navigation & Common
  welcome: string
  dashboard: string
  overview: string
  newRequest: string
  calendar: string
  approvals: string
  reports: string
  settings: string
  signOut: string
  signIn: string

  // Authentication
  welcomeBack: string
  signInToAccount: string
  email: string
  password: string
  signingIn: string
  demoAccounts: string
  tryDifferentRoles: string
  employee: string
  supervisor: string
  hrManager: string
  director: string

  // Dashboard
  welcomeBackUser: string
  loggedInAs: string
  leaveBalance: string
  annualLeaveRemaining: string
  pendingRequests: string
  awaitingApproval: string
  approvalsNeeded: string
  requestsToReview: string
  teamMembers: string
  activeEmployees: string
  recentLeaveRequests: string
  latestApplications: string
  noRequestsFound: string
  createFirstRequest: string

  // Leave Request Form
  newLeaveRequest: string
  submitNewRequest: string
  leaveType: string
  duration: string
  day: string
  days: string
  startDate: string
  endDate: string
  reasonForLeave: string
  emergencyContact: string
  workHandoverDetails: string
  clearForm: string
  submitRequest: string
  submitting: string

  // Leave Types
  annualLeave: string
  sickLeave: string
  emergencyLeave: string
  maternityLeave: string
  paternityLeave: string
  unpaidLeave: string

  // Messages
  loginRequired: string
  fillRequiredFields: string
  endDateAfterStart: string
  requestSubmittedSuccess: string
  requestSubmissionError: string

  // Business Customization
  companyName: string
  departments: string[]
  leaveTypes: string[]
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Common
    welcome: "Welcome",
    dashboard: "Dashboard",
    overview: "Overview",
    newRequest: "New Request",
    calendar: "Calendar",
    approvals: "Approvals",
    reports: "Reports",
    settings: "Settings",
    signOut: "Sign Out",
    signIn: "Sign In",

    // Authentication
    welcomeBack: "Welcome back",
    signInToAccount: "Sign in to your CloudLeave account",
    email: "Email",
    password: "Password",
    signingIn: "Signing In...",
    demoAccounts: "Demo Accounts",
    tryDifferentRoles: "Try different user roles",
    employee: "Employee",
    supervisor: "Supervisor",
    hrManager: "HR Manager",
    director: "Director",

    // Dashboard
    welcomeBackUser: "Welcome back",
    loggedInAs: "You're logged in as",
    leaveBalance: "Leave Balance",
    annualLeaveRemaining: "Annual leave remaining",
    pendingRequests: "Pending Requests",
    awaitingApproval: "Awaiting approval",
    approvalsNeeded: "Approvals Needed",
    requestsToReview: "Requests to review",
    teamMembers: "Team Members",
    activeEmployees: "Active employees",
    recentLeaveRequests: "Recent Leave Requests",
    latestApplications: "Your latest leave applications",
    noRequestsFound: "No leave requests found",
    createFirstRequest: "Create Your First Request",

    // Leave Request Form
    newLeaveRequest: "New Leave Request",
    submitNewRequest: "Submit a new leave request for approval",
    leaveType: "Leave Type",
    duration: "Duration",
    day: "day",
    days: "days",
    startDate: "Start Date",
    endDate: "End Date",
    reasonForLeave: "Reason for Leave",
    emergencyContact: "Emergency Contact",
    workHandoverDetails: "Work Handover Details",
    clearForm: "Clear Form",
    submitRequest: "Submit Request",
    submitting: "Submitting...",

    // Leave Types
    annualLeave: "Annual Leave",
    sickLeave: "Sick Leave",
    emergencyLeave: "Emergency Leave",
    maternityLeave: "Maternity Leave",
    paternityLeave: "Paternity Leave",
    unpaidLeave: "Unpaid Leave",

    // Messages
    loginRequired: "You must be logged in to submit a leave request",
    fillRequiredFields: "Please fill in all required fields",
    endDateAfterStart: "End date must be after start date",
    requestSubmittedSuccess: "Leave request submitted successfully!",
    requestSubmissionError: "An error occurred while submitting the request. Please try again.",

    // Business Customization
    companyName: "ADPA",
    departments: ["IT", "HR", "Finance", "Operations", "Marketing", "Sales"],
    leaveTypes: ["Annual Leave", "Sick Leave", "Emergency Leave", "Maternity Leave", "Paternity Leave", "Unpaid Leave"],
  },

  pt: {
    // Navigation & Common
    welcome: "Bem-vindo",
    dashboard: "Painel",
    overview: "Visão Geral",
    newRequest: "Nova Solicitação",
    calendar: "Calendário",
    approvals: "Aprovações",
    reports: "Relatórios",
    settings: "Configurações",
    signOut: "Sair",
    signIn: "Entrar",

    // Authentication
    welcomeBack: "Bem-vindo de volta",
    signInToAccount: "Entre na sua conta CloudLeave",
    email: "E-mail",
    password: "Senha",
    signingIn: "Entrando...",
    demoAccounts: "Contas Demo",
    tryDifferentRoles: "Experimente diferentes funções",
    employee: "Funcionário",
    supervisor: "Supervisor",
    hrManager: "Gerente de RH",
    director: "Diretor",

    // Dashboard
    welcomeBackUser: "Bem-vindo de volta",
    loggedInAs: "Você está logado como",
    leaveBalance: "Saldo de Férias",
    annualLeaveRemaining: "Férias anuais restantes",
    pendingRequests: "Solicitações Pendentes",
    awaitingApproval: "Aguardando aprovação",
    approvalsNeeded: "Aprovações Necessárias",
    requestsToReview: "Solicitações para revisar",
    teamMembers: "Membros da Equipe",
    activeEmployees: "Funcionários ativos",
    recentLeaveRequests: "Solicitações de Licença Recentes",
    latestApplications: "Suas últimas solicitações de licença",
    noRequestsFound: "Nenhuma solicitação de licença encontrada",
    createFirstRequest: "Crie Sua Primeira Solicitação",

    // Leave Request Form
    newLeaveRequest: "Nova Solicitação de Licença",
    submitNewRequest: "Envie uma nova solicitação de licença para aprovação",
    leaveType: "Tipo de Licença",
    duration: "Duração",
    day: "dia",
    days: "dias",
    startDate: "Data de Início",
    endDate: "Data de Término",
    reasonForLeave: "Motivo da Licença",
    emergencyContact: "Contato de Emergência",
    workHandoverDetails: "Detalhes da Transferência de Trabalho",
    clearForm: "Limpar Formulário",
    submitRequest: "Enviar Solicitação",
    submitting: "Enviando...",

    // Leave Types
    annualLeave: "Férias Anuais",
    sickLeave: "Licença Médica",
    emergencyLeave: "Licença de Emergência",
    maternityLeave: "Licença Maternidade",
    paternityLeave: "Licença Paternidade",
    unpaidLeave: "Licença Não Remunerada",

    // Messages
    loginRequired: "Você deve estar logado para enviar uma solicitação de licença",
    fillRequiredFields: "Por favor, preencha todos os campos obrigatórios",
    endDateAfterStart: "A data de término deve ser posterior à data de início",
    requestSubmittedSuccess: "Solicitação de licença enviada com sucesso!",
    requestSubmissionError: "Ocorreu um erro ao enviar a solicitação. Tente novamente.",

    // Business Customization
    companyName: "ADPA",
    departments: ["TI", "RH", "Financeiro", "Operações", "Marketing", "Vendas"],
    leaveTypes: [
      "Férias Anuais",
      "Licença Médica",
      "Licença de Emergência",
      "Licença Maternidade",
      "Licença Paternidade",
      "Licença Não Remunerada",
    ],
  },

  fr: {
    // Navigation & Common
    welcome: "Bienvenue",
    dashboard: "Tableau de bord",
    overview: "Aperçu",
    newRequest: "Nouvelle demande",
    calendar: "Calendrier",
    approvals: "Approbations",
    reports: "Rapports",
    settings: "Paramètres",
    signOut: "Se déconnecter",
    signIn: "Se connecter",

    // Authentication
    welcomeBack: "Bon retour",
    signInToAccount: "Connectez-vous à votre compte CloudLeave",
    email: "E-mail",
    password: "Mot de passe",
    signingIn: "Connexion...",
    demoAccounts: "Comptes de démonstration",
    tryDifferentRoles: "Essayez différents rôles",
    employee: "Employé",
    supervisor: "Superviseur",
    hrManager: "Responsable RH",
    director: "Directeur",

    // Dashboard
    welcomeBackUser: "Bon retour",
    loggedInAs: "Vous êtes connecté en tant que",
    leaveBalance: "Solde de congés",
    annualLeaveRemaining: "Congés annuels restants",
    pendingRequests: "Demandes en attente",
    awaitingApproval: "En attente d'approbation",
    approvalsNeeded: "Approbations nécessaires",
    requestsToReview: "Demandes à examiner",
    teamMembers: "Membres de l'équipe",
    activeEmployees: "Employés actifs",
    recentLeaveRequests: "Demandes de congé récentes",
    latestApplications: "Vos dernières demandes de congé",
    noRequestsFound: "Aucune demande de congé trouvée",
    createFirstRequest: "Créez votre première demande",

    // Leave Request Form
    newLeaveRequest: "Nouvelle demande de congé",
    submitNewRequest: "Soumettre une nouvelle demande de congé pour approbation",
    leaveType: "Type de congé",
    duration: "Durée",
    day: "jour",
    days: "jours",
    startDate: "Date de début",
    endDate: "Date de fin",
    reasonForLeave: "Raison du congé",
    emergencyContact: "Contact d'urgence",
    workHandoverDetails: "Détails de la passation de travail",
    clearForm: "Effacer le formulaire",
    submitRequest: "Soumettre la demande",
    submitting: "Soumission...",

    // Leave Types
    annualLeave: "Congés annuels",
    sickLeave: "Congé maladie",
    emergencyLeave: "Congé d'urgence",
    maternityLeave: "Congé de maternité",
    paternityLeave: "Congé de paternité",
    unpaidLeave: "Congé sans solde",

    // Messages
    loginRequired: "Vous devez être connecté pour soumettre une demande de congé",
    fillRequiredFields: "Veuillez remplir tous les champs obligatoires",
    endDateAfterStart: "La date de fin doit être postérieure à la date de début",
    requestSubmittedSuccess: "Demande de congé soumise avec succès!",
    requestSubmissionError: "Une erreur s'est produite lors de la soumission de la demande. Veuillez réessayer.",

    // Business Customization
    companyName: "ADPA",
    departments: ["IT", "RH", "Finance", "Opérations", "Marketing", "Ventes"],
    leaveTypes: [
      "Congés annuels",
      "Congé maladie",
      "Congé d'urgence",
      "Congé de maternité",
      "Congé de paternité",
      "Congé sans solde",
    ],
  },
}

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.en
}
