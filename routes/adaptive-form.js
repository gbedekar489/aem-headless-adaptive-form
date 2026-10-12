const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const formUrl = req.query.url;

    if (!formUrl) {
      return res.status(400).json({
        error: "Adaptive Form URL is required"
      });
    }

    const url = new URL(formUrl);

    // Basic safety validation
    if (
      url.protocol !== "https:" ||
      !url.hostname.endsWith(
        ".adobeaemcloud.com"
      ) ||
      !url.pathname.startsWith(
        "/adobe/forms/af/"
      )
    ) {
      return res.status(400).json({
        error:
          "Enter a valid AEM Forms Cloud Service Adaptive Form URL"
      });
    }

    const response = await axios.get(
      formUrl,
      {
        headers: {
          Accept: "application/json"
        }
      }
    );

    return res.json(response.data);

  } catch (error) {
    console.error(
      "AEM form request failed:",
      error.response?.status ||
        error.message
    );

    return res.status(502).json({
      error:
        "Unable to retrieve Adaptive Form",
      status:
        error.response?.status
    });
  }
});

module.exports = router;