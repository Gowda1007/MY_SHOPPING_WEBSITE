const http = require("http");
const app = require("./app");
const PORT = process.env.PORT || 3051;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server is running in PORT ${PORT}`);
});
