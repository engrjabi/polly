import shelljs from 'shelljs'
import find from 'find-process'
import format from 'date-fns/format'
import jsonFile from 'jsonfile'
import daemonizeProcess from 'daemonize-process'
// import opn from 'opn'

const pollIntervalMs = 60000

setInterval(() => {
  (async () => {
    // Declare variables
    const timeStamp = Date.now()
    const formattedDate = format(timeStamp, 'MMM-DD-YYYY')
    const formattedDateTime = format(timeStamp, 'MMM-DD-YYYY--hh:mm_A')
    const minutes = parseInt(format(timeStamp, 'mm'))
    const jsonFileName = `./${formattedDate}.json`
    let imageName = null

    // Get active window meta data
    const getActiveWindowPid = shelljs.exec('xdotool getwindowpid `xdotool getactivewindow`')
    const getActiveWindowName = shelljs.exec('xdotool getactivewindow getwindowname')
    const activeWindowPid = getActiveWindowPid.stdout.trim()
    const activeWindowName = getActiveWindowName.stdout.trim()
    const activeWindowDetails = await find('pid', activeWindowPid)

    // Get active window image every 5 minutes only
    if (minutes === 0 || (minutes % 5) === 0) {
      // TODO: Process image for ocr
      imageName = `${formattedDateTime}.jpg`
      shelljs.exec(`scrot -u "${imageName}"`)
    }

    // Collate all data to be saved
    const dataToSave = {
      formattedDateTime,
      timeStamp,
      activeWindowName,
      imageName,
      activeWindowDetails
    }

    // Save details on JSON
    jsonFile.writeFileSync(jsonFileName, dataToSave, {flag: 'a'})
  })()
}, pollIntervalMs)

// TODO
// ~~~~~~~~~~~~~~~~~~~ CRASH HANDLING ~~~~~~~~~~~~~~~~~~~ //
//so the program will not close instantly
// process.stdin.resume()
//
// for (const event of ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM']) {
//   process.on(event, () => {
//     console.log('ggggggggggggggg')
//     return opn('https://local-vcr-crashed/')
//   })
// }
// ~~~~~~~~~~~~~~~~~~~ CRASH HANDLING ~~~~~~~~~~~~~~~~~~~ //

// Let process run in background
daemonizeProcess();
