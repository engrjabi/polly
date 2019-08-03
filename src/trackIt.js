import shelljs from 'shelljs'
import find from 'find-process'
import format from 'date-fns/format'
import jsonFile from 'jsonfile'
import mkdirp from 'mkdirp'
import {TesseractWorker} from 'tesseract.js'
import path from 'path'
import progressBar from 'progressbar'

/**
 * Before using this download language models at https://github.com/tesseract-ocr/tessdata
 * Then put all of its content on lang-data directory at the root of the project
 *
 * @type {TesseractWorker}
 */
const worker = new TesseractWorker({
  langPath: path.join(__dirname, '../lang-data'),
  gzip: false,
  cacheMethod: 'none'
})

// Ensure root dir exists
const rootDirName = `./archive/${format(Date.now(), 'MMM-DD-YYYY')}`
mkdirp.sync(rootDirName)

/**
 * This function records the metadata about the active window, captures the screen then takes an OCR of it.
 * This data will be valuable to the end user if they need to review how or what they did on a particular
 * Day using their computer
 */
export const trackIt = async () => {
  // Declare variables
  const timeStamp = Date.now()
  const formattedDate = format(timeStamp, 'MMM-DD-YYYY')
  const formattedDateTime = format(timeStamp, 'MMM-DD-YYYY--hh:mm_A')
  const minutes = parseInt(format(timeStamp, 'mm'))
  const jsonFileName = `${formattedDate}.json`
  let imageName = null

  // Get active window meta data
  const getActiveWindowPid = shelljs.exec('xdotool getwindowpid `xdotool getactivewindow`', {silent: true})
  const getActiveWindowName = shelljs.exec('xdotool getactivewindow getwindowname', {silent: true})
  const activeWindowPid = getActiveWindowPid.stdout.trim()
  const activeWindowName = getActiveWindowName.stdout.trim()
  const activeWindowDetails = await find('pid', activeWindowPid)

  console.log('ACTIVE WINDOW:', activeWindowName)

  // Get active window image
  imageName = `${formattedDateTime}.png`
  shelljs.exec(`scrot --quality 100 --focused "${rootDirName}/${imageName}"`)
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Process captured image for OCR
  const progress = progressBar.create().step('OCR for screen capture of active window')
  progress.setTotal(1)
  const ocrData = await new Promise(resolve => {
    worker
      .recognize(`${rootDirName}/${imageName}`)
      .progress((info) => {
        if (info.progress) {
          progress.setTick(info.progress.toFixed(2))
        }
      })
      .then((result) => {
        console.log('~~~ OCR RESULT START ~~~')
        console.log(result.text)
        console.log('~~~ OCR RESULT END ~~~')
        progress.finish()
        resolve(result.text)
      })
  })

  // Collate all data to be saved
  const dataToSave = {
    formattedDateTime,
    timeStamp,
    activeWindowName,
    imageName,
    activeWindowDetails,
    ocrData
  }

  // Save details on JSON
  jsonFile.writeFileSync(`${rootDirName}/${jsonFileName}`, dataToSave, {flag: 'a'})
}
