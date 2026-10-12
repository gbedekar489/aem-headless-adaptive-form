const express = require("express");
const path = require("path");

const adaptiveFormRouter =
  require("./routes/adaptive-form");

const app = express();

const PORT =
  process.env.PORT || 3000;

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

app.use(
  "/api/adaptive-form",
  adaptiveFormRouter
);

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});