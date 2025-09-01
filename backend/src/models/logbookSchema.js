
export const hikeSchema = {
  title: "string",      // short name of the hike
  location: "string",   // where it happened
  date: "timestamp",    // when it happened
  distance: "number",   // distance in km
  duration: "number",   // time taken (in hours/mins)
  notes: "string",      // optional notes
  userId: "string",     // user who logged the hike
};
