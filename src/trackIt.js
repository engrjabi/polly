import shelljs from "shelljs";
import find from "find-process";
import format from "date-fns/format";
import jsonFile from "jsonfile";
import mkdirp from "mkdirp";
import { doOcr } from "./ocrProcess";
import readLastLines from "read-last-lines";
import * as fileExists from "file-exists";
import { imageCompare } from "./imageCompare";

/**
 * This function records the metadata about the active window, captures the screen then takes an OCR of it.
 * This data will be valuable to the end user if they need to review how or what they did on a particular
 * Day using their computer
 */
export const trackIt = async (rootDirName = "archive") => {
  // Ensure root dir exists
  const timeStamp = Date.now();
  const formattedDate = format(timeStamp, "MMM-DD-YYYY");
  const rootDirPath = `./${rootDirName}/${formattedDate}`;
  mkdirp.sync(rootDirPath);

  // Declare variables
  const formattedDateTime = format(timeStamp, "MMM-DD-YYYY--hh:mm_A");
  const imagePath = `${rootDirPath}/${formattedDateTime}.png`;
  const metaDataJsonPath = `${rootDirPath}/${formattedDate}.json`;

  // Get active window meta data
  const getActiveWindowPid = shelljs.exec("xdotool getwindowpid `xdotool getactivewindow`", { silent: true });
  const getActiveWindowName = shelljs.exec("xdotool getactivewindow getwindowname", { silent: true });
  const activeWindowPid = getActiveWindowPid.stdout.trim();
  const activeWindowName = getActiveWindowName.stdout.trim();
  const activeWindowDetails = await find("pid", activeWindowPid);

  console.log("ACTIVE WINDOW:", activeWindowName);

  // Get active window image
  shelljs.exec(`scrot --quality 100 --focused "${imagePath}"`);

  // Wait a bit to ensure the screen capture is already saved
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Process captured image for OCR
  const ocrData = await doOcr(imagePath);

  // Read last line of metaDataJsonPath to get file name of last image for comparison
  let diffWithPrev;
  if (fileExists.sync(metaDataJsonPath)) {
    const lastLine = await new Promise(resolve => readLastLines.read(metaDataJsonPath, 1).then(resolve));
    let lastLineParse;
    try {
      lastLineParse = JSON.parse(lastLine);
      const prevImagePath = `${rootDirPath}/${lastLineParse.formattedDateTime}.png`;
      // Do comparison
      diffWithPrev = await imageCompare(prevImagePath, imagePath);
      console.log("Class: , Function: trackIt, Line 48 {lastLine}(): ", { prevImagePath, currImageName: imagePath, diffWithPrev });
    } catch (e) {
      lastLineParse = lastLine;
    }
  }

  // Collate all data to be saved
  const dataToSave = {
    formattedDateTime,
    timeStamp,
    activeWindowName,
    imageName: `${formattedDateTime}.png`,
    activeWindowDetails,
    ocrData,
    diffWithPrev
  };

  // Save details on JSON
  jsonFile.writeFileSync(metaDataJsonPath, dataToSave, {
    flag: "a"
  });
};
