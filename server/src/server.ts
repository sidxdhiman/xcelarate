// import app from "./app";
// const PORT = Number(process.env.PORT) || 9000;

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on http://0.0.0.0:${PORT}`);
// });

// src/server.ts
import app from "./app";

const PORT = Number(process.env.PORT) || 9000;

// Listen on all interfaces so mobile devices can reach it
app.listen(PORT, "0.0.0.0", () => {
  const BASE_URL = "https://nonwoven-adan-drivingly.ngrok-free.dev";
  console.log(`Ngrok URL: ${process.env.NGROK_URL}`);
});
