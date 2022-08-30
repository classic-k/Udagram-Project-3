import express, { Request, Response } from "express";
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

  app.get("/", async (req: Request, res: Response) => {
    res.status(200).send({
      message: "try GET /filteredimage?image_url={{}}",
      status_code: 200,
    });
  });

  app.get("/filteredimage", apiKey, async (req: Request, res: Response) => {
    let url = req.query.image_url;

    if (!url || !vetUrl(url)) {
      return res
        .status(400)
        .send({ message: "Provide a valid jpeg image url", status_code: 400 });
    }
    filterImageFromURL(url)
      .then((outpath) => {
        res.status(201).sendFile(outpath);
      })
      .catch((err) => {
        res.status(400).send({
          message: "URL not pointing to image or invalid",
          status_code: 400,
        });
      })
      .finally(() => {
        let folder = __dirname;
        folder = path.join(folder, "tmp");
        listdir(folder, deleteLocalFiles);
      });
  });

  app.use((req: Request, res: Response, next: () => any) => {
    res.status(404).send({ message: "Route not found", status_code: 404 });
  });
  app.use((err: Error, req: Request, res: Response, next: () => any) => {
    res.status(500).send({ mesaage: "An error occur", status_code: 500 });
  });
  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
