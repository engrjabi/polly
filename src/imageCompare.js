import compareImages from "resemblejs/compareImages";
import readFilePromise from "fs-readfile-promise";

export const imageCompare = async (prevImagePath, currImagePath) => {
  const options = {
    scaleToSameSize: true,
    ignore: "less"
  };
  return await compareImages(await readFilePromise(prevImagePath), await readFilePromise(currImagePath), options);
};
