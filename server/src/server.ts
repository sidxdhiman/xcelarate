import app from "./app";
const PORT = Number(process.env.PORT) || 9000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
