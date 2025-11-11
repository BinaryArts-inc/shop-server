export const QueueRegistry = {
  MAIL: "MAIL"
} as const

export type QueueNameType = (typeof QueueRegistry)[keyof typeof QueueRegistry]
