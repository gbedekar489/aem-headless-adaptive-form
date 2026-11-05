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

    const parsedUrl = new URL(formUrl);

    // Restrict requests to AEM Cloud Service Publish hosts
    if (
      parsedUrl.protocol !== "https:" ||
      !/^publish-[a-z0-9-]+\.adobeaemcloud\.com$/i.test(
        parsedUrl.hostname
      ) ||
      parsedUrl.port ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      return res.status(400).json({
        error: "Invalid AEM Publish URL"
      });
    }

    const path = decodeURIComponent(parsedUrl.pathname);

    let encodedId;

    // Support an already encoded Forms API URL
    if (path.startsWith("/adobe/forms/af/")) {
      encodedId = path.substring("/adobe/forms/af/".length);

      if (
        !/^[A-Za-z0-9_-]+={0,2}$/.test(encodedId) ||
        !Buffer.from(encodedId, "base64")
          .toString("utf8")
          .startsWith("/content/forms/af/")
      ) {
        return res.status(400).json({
          error: "Invalid encoded form ID"
        });
      }

    } else {
      // Support normal AEM form repository URLs
      const formPath = path
        .replace(/\.html$/, "")
        .replace(/\/$/, "");

      if (
        !/^\/content\/forms\/af\/[a-zA-Z0-9_/-]+$/.test(
          formPath
        )
      ) {
        return res.status(400).json({
          error: "Invalid Adaptive Form path"
        });
      }

      encodedId = Buffer.from(formPath, "utf8")
        .toString("base64");
    }

    const aemUrl =
      `${parsedUrl.origin}/adobe/forms/af/${encodedId}`;

    console.log("Fetching Adaptive Form from AEM");

    const response = await axios.get(aemUrl, {
      headers: {
        Accept: "application/json"
      },
      timeout: 15000,
      maxRedirects: 0
    });

    return res.json(response.data);

  } catch (error) {
    console.error(
      "AEM form request failed:",
      error.response?.status || error.message
    );

    return res.status(502).json({
      error: "Unable to retrieve Adaptive Form",
      status: error.response?.status
    });
  }
});

module.exports = router;