import progressBar from "progressbar";
import { TesseractWorker } from "tesseract.js";
import path from "path";

export const doOcr = async imagePath => {
  /**
   * Before using this download language models at https://github.com/tesseract-ocr/tessdata
   * Then put all of its content on lang-data directory at the root of the project
   *
   * @type {TesseractWorker}
   */
  const worker = new TesseractWorker({
    langPath: path.join(__dirname, "../lang-data"),
    gzip: false,
    cacheMethod: "none"
  });

  const progress = progressBar.create().step("OCR for screen capture of active window");
  progress.setTotal(1);

  return await new Promise(resolve => {
    worker
      .recognize(imagePath)
      .progress(info => {
        if (info.progress) {
          progress.setTick(info.progress.toFixed(2));
        }
      })
      .then(result => {
        console.log("~~~ OCR RESULT START ~~~");
        console.log(result.text);
        console.log("~~~ OCR RESULT END ~~~");
        progress.finish();
        worker.terminate();
        resolve(result.text);
      });
  });
};
