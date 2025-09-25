import app from "./app";
const PORT = Number(process.env.PORT) || 9000;

app.listen(9000, '0.0.0.0', () => {
  console.log(`Server running on port: 9000`);
});
