import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "check dead users",
  { minutes: 60 }, // Run every hour
  internal.deadMan.checkDeadUsers,
);

export default crons;
