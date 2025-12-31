export const settingPage = {
  floors: "floors",
  printer: "printer",
  emergencyCommands: "emergencyCommands",
  users: "users",
  account: "account",
  serverProtection: "serverProtection",
  softwareUpgrade: "softwareUpgrade",
  diagnostics: "diagnostics",
  experimental: "experimental",
  debugSocket: "debugSocket",
  about: "about",
} as const;

export const settingsPage = {
  [settingPage.floors]: {
    title: "Floors",
    icon: "house_siding",
    path: "/settings/floors",
    divider: true,
  },
  [settingPage.printer]: {
    title: "Printer",
    icon: "local_print_shop",
    path: "/settings/printer",
    divider: false,
  },
  [settingPage.emergencyCommands]: {
    title: "Emergency Commands",
    icon: "warning",
    path: "/settings/emergency-commands",
    divider: true,
  },
  [settingPage.serverProtection]: {
    title: "Server Protection",
    icon: "security",
    path: "/settings/server-protection",
    divider: false,
  },
  [settingPage.users]: {
    title: "Users",
    icon: "group",
    path: "/settings/user-management",
    divider: false,
  },
  [settingPage.account]: {
    title: "Account",
    icon: "account_circle",
    path: "/settings/account",
    divider: true,
  },
  [settingPage.softwareUpgrade]: {
    title: "Software Upgrade",
    icon: "upgrade",
    path: "/settings/software-upgrade",
    divider: false,
  },
  [settingPage.diagnostics]: {
    title: "Diagnostics",
    icon: "bug_report",
    path: "/settings/diagnostics",
    divider: false,
  },
  [settingPage.experimental]: {
    title: "Experimental",
    icon: "settings_applications",
    path: "/settings/experimental",
    divider: false,
  },
  [settingPage.debugSocket]: {
    title: "SocketIO Debug",
    icon: "wifi_tethering",
    path: "/settings/debug-socket",
    divider: true,
  },
  [settingPage.about]: {
    title: "About",
    icon: "info",
    path: "/settings/about",
    divider: false,
  },
} as const;
