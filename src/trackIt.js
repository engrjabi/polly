import shelljs from "shelljs";
import find from "find-process";
import format from "date-fns/format";
import jsonFile from "jsonfile";
import mkdirp from "mkdirp";
import { doOcr } from "./ocrProcess";

/**
 * This function records the metadata about the active window, captures the screen then takes an OCR of it.
 * This data will be valuable to the end user if they need to review how or what they did on a particular
 * Day using their computer
 */
export const trackIt = async (rootDirName = "archive") => {
  // Ensure root dir exists
  const rootDirPath = `./${rootDirName}/${format(Date.now(), "MMM-DD-YYYY")}`;
  mkdirp.sync(rootDirPath);

  // Declare variables
  const timeStamp = Date.now();
  const formattedDate = format(timeStamp, "MMM-DD-YYYY");
  const formattedDateTime = format(timeStamp, "MMM-DD-YYYY--hh:mm_A");
  const jsonFileName = `${formattedDate}.json`;
  let imageName;

  // Get active window meta data
  const getActiveWindowPid = shelljs.exec("xdotool getwindowpid `xdotool getactivewindow`", { silent: true });
  const getActiveWindowName = shelljs.exec("xdotool getactivewindow getwindowname", { silent: true });
  const activeWindowPid = getActiveWindowPid.stdout.trim();
  const activeWindowName = getActiveWindowName.stdout.trim();
  const activeWindowDetails = await find("pid", activeWindowPid);

  console.log("ACTIVE WINDOW:", activeWindowName);

  // Get active window image
  imageName = `${formattedDateTime}.png`;
  shelljs.exec(`scrot --quality 100 --focused "${rootDirPath}/${imageName}"`);

  // Wait a bit to ensure the screen capture is already saved
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Process captured image for OCR
  const ocrData = await doOcr(`${rootDirPath}/${imageName}`);

  // Collate all data to be saved
  const dataToSave = {
    formattedDateTime,
    timeStamp,
    activeWindowName,
    imageName,
    activeWindowDetails,
    ocrData
  };

  // Save details on JSON
  jsonFile.writeFileSync(`${rootDirPath}/${jsonFileName}`, dataToSave, {
    flag: "a"
  });
};
