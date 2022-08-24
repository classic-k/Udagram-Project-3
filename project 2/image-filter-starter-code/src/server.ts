import express from "express";
import path from "path";
import bodyParser from "body-parser";
import {
  filterImageFromURL,
  deleteLocalFiles,
  vetUrl,
  listdir,
  apiKey,
} from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  app.get("/filteredimage", apiKey, async (req, res) => {
    let url = req.query.image_url;
    console.log(url);
    if (!url || !vetUrl(url)) {
      return res.status(200).send("Provide a valid jpeg image url");
    }
    filterImageFromURL(url)
      .then((outpath) => {
        res.sendFile(outpath);
      })
      .catch((err) => {
        //console.log(err);
        res.send("URL not pointing to image or invalid");
      })
      .finally(() => {
        let folder = __dirname;
        folder = path.join(folder, "tmp");
        let lst = listdir(folder);

        deleteLocalFiles(lst).then();
      });
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
