const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 3001;

app.use(cors());

const audioUrl =
  "https://harlequin-secure-tortoise-165.mypinata.cloud/ipfs/bafybeicfoe2pibqjnogdtvbbmfahow2hxoshmiqwvhfhxbhjlerue2at5i";

app.get("/test", async (req, res) => {
  try {
    const response = await axios.head(audioUrl);
    res.json({
      status: "success",
      message: "Audio file is accessible",
      contentType: response.headers["content-type"],
      contentLength: response.headers["content-length"],
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to access audio file",
      error: error.message,
      details: error.response ? error.response.data : null,
    });
  }
});

app.get("/stream", async (req, res) => {
  const range = req.headers.range;

  try {
    const headResponse = await axios.head(audioUrl);
    const contentLength = headResponse.headers["content-length"];
    const contentType = headResponse.headers["content-type"];

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
      const chunksize = end - start + 1;

      const rangeResponse = await axios({
        method: "get",
        url: audioUrl,
        responseType: "stream",
        headers: { Range: `bytes=${start}-${end}` },
      });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${contentLength}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
      });

      rangeResponse.data.pipe(res);
    } else {
      const fullResponse = await axios({
        method: "get",
        url: audioUrl,
        responseType: "stream",
      });

      res.writeHead(200, {
        "Content-Length": contentLength,
        "Content-Type": contentType,
      });

      fullResponse.data.pipe(res);
    }
  } catch (error) {
    console.error("Error streaming audio:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    res.status(500).send("Error streaming audio");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
