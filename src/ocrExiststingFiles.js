import LineByLineReader from "line-by-line";
import jsonFile from "jsonfile";
import * as fileExists from "file-exists";
import { doOcr } from "./ocrProcess";
import path from "path";

/**
 * Only use this for cases that the track-it files do not have ocr data yet
 *
 * @param rootDir - root directory ex. (path.join(__dirname, "../archive/Jul-30-2019"))
 * @param metaFileName - json file name of the metadata ex. (Jul-30-2019.json)
 * @param imageExtension - extension of image files in root directory. Defaults to jpg
 */
const addOcrToTrackItFilesWithNoOcr = (rootDir, metaFileName, imageExtension = "jpg") => {
  const lr = new LineByLineReader(`${rootDir}/${metaFileName}`);

  lr.on("error", function(err) {
    console.log("ERROR", err);
  });

  lr.on("line", async function(line) {
    lr.pause();
    const lineParsed = JSON.parse(line);
    const imageName = `${rootDir}/${lineParsed.formattedDateTime}.${imageExtension}`;

    console.log(`PROCESSING: ${imageName}`);

    if (!fileExists.sync(imageName)) {
      lr.resume();
      return;
    }

    const ocrData = await doOcr(imageName);

    const dataToSave = {
      ...lineParsed,
      ocrData
    };

    jsonFile.writeFileSync(`${rootDir}/ocr.${metaFileName}`, dataToSave, { flag: "a" });
    lr.resume();
  });

  lr.on("end", function() {
    console.log("DONE");
  });
};

/**
 * Example call
 */
// addOcrToTrackItWithNoOcr(path.join(__dirname, "../archive/Jul-30-2019"), "Jul-30-2019.json");
