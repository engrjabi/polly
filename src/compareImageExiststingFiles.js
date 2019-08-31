import LineByLineReader from "line-by-line";
import jsonFile from "jsonfile";
import * as fileExists from "file-exists";
import path from "path";
import { imageCompare } from "./imageCompare";

/**
 * Only use this for cases that the track-it files do not have image compare data yet
 *
 * @param rootDir - root directory ex. (path.join(__dirname, "../archive/Jul-30-2019"))
 * @param metaFileName - json file name of the metadata ex. (Jul-30-2019.json)
 * @param imageExtension - extension of image files in root directory. Defaults to jpg
 */
const addImageCompareMetaToTrackItFiles = (rootDir, metaFileName, imageExtension = "jpg") => {
  let count = 0;
  let prevLine = "{}";

  const lr = new LineByLineReader(`${rootDir}/${metaFileName}`);

  lr.on("error", function(err) {
    console.log("ERROR", err);
  });

  lr.on("line", async function(line) {
    count = count + 1;

    lr.pause();

    if (count === 1) {
      prevLine = line;
      lr.resume();
      return;
    }

    const prevLineParsed = JSON.parse(prevLine);
    const lineParsed = JSON.parse(line);
    const imageName = `${rootDir}/${lineParsed.formattedDateTime}.${imageExtension}`;
    const prevImageName = `${rootDir}/${prevLineParsed.formattedDateTime}.${imageExtension}`;

    console.log(`PROCESSING: ${imageName}`);

    if (!fileExists.sync(imageName)) {
      prevLine = line;
      lr.resume();
      return;
    }

    const diffWithPrev = await imageCompare(prevImageName, imageName);

    const dataToSave = {
      ...lineParsed,
      diffWithPrev
    };

    jsonFile.writeFileSync(`${rootDir}/imageCompare.${metaFileName}`, dataToSave, { flag: "a" });
    prevLine = line;
    lr.resume();
  });

  lr.on("end", function() {
    console.log("DONE");
  });
};

/**
 * Example call
 */
addImageCompareMetaToTrackItFiles(path.join(__dirname, "../archive/Aug-29-2019"), "Aug-29-2019.json", "png");
