import { PLAN_INTERVAL } from "../enums/plan-interval.enum"

// Type representing a valid plan interval
export type PlanInterval = (typeof PLAN_INTERVAL)[number]
