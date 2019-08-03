import shelljs from 'shelljs'
import notifier from 'node-notifier'
import path from 'path'
import {thirdPartyCliChecker} from './util'

thirdPartyCliChecker([
  'free',
  'mplayer'
])

export const checkSystemMemory = async () => {
  // Declare variables
  const freeRamPercentageThreshold = 0.1

  // Get system info using free command from shell
  const getMaxRam = shelljs.exec('free -m |awk \'NR == 2\'| awk \'{print $2}\'', {silent: true})
  const getAvailableRam = shelljs.exec('free -m |awk \'NR == 2\'| awk \'{print $7}\'', {silent: true})
  const maxRam = parseInt(getMaxRam.stdout.trim())
  const availableRam = parseInt(getAvailableRam.stdout.trim())

  // Trigger notification with sound if threshold is met
  const freeRamPercentage = availableRam / maxRam

  if (freeRamPercentage <= freeRamPercentageThreshold) {
    notifier.notify({
      title: 'GG na RAM mo',
      message: `Available Ram: ${freeRamPercentage.toFixed(2) * 100}%`,
      urgency: 'critical'
    })
    shelljs.exec(`mplayer ${path.join(__dirname, '../assets/sounds/notif.mp3')}`)
  }
}
