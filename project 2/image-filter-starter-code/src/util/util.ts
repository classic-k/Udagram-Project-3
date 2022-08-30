import fs from "fs";
import { Request, Response } from "express";
import Jimp = require("jimp");
import path from "path";
import axios from "axios";
//import axios from "axios";

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file

export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios.get(inputURL, { responseType: "arraybuffer" });
      const img_streams = res.data;
      const photo = await Jimp.read(img_streams);
      const outpath = path.join(
        "tmp",
        "filtered." + Math.floor(Math.random() * 2000) + ".jpg"
      );
      // console.log(photo);
      // const img =  await photo
      photo.resize(256, 256);
      photo.quality(60); // set JPEG quality
      photo.greyscale(); // set greyscale
      photo.write(path.join(__dirname, "..", outpath), (img) => {
        resolve(path.join(__dirname, "..", outpath));
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
export function listdir(
  folder: string,
  callback: (args: Array<string>) => void
) {
  //let l =
  fs.readdir(folder, (err, files) => {
    let lst = [];
    for (let file of files) {
      lst.push(path.join(folder, file));
    }
    callback(lst);
    //return flst;
  });
  // console.log("from list", flst);
  //return flst;
}
export function vetUrl(url: string): boolean {
  const pattern = /http|https:\/\/(www\.)?[a-zA-Z0-9.]+\.[a-zA-Z0-9]+\/\w+/i; ///http|https:\/\/(www\.)?[a-zA-Z0-9.]+\.[a-zA-Z0-9]+\/\w+/i;
  console.log("Invalid url");
  return pattern.test(url); //&& url.endsWith(".jpg");
}

export const apiKey = (req: Request, res: Response, next: () => any) => {
  const key = req.headers["x-api-key"];
  if (!key || key !== "sk_cloudtravel") {
    console.log("Authorised partially");
    //return res.status(401).send("Unauthorized");
  }
  next();
};
