import { checkSystemMemory } from "./checkSystemMemory";
import { trackIt } from "./trackIt";
import daemonizeProcess from "daemonize-process";
import { localServerNotifier } from "./localServerNotifier";

const pollIntervalMs = 90000;

const mainThread = async () => {
  // Record user active window
  await trackIt();

  // check RAM if it is about to be full. Then notify user if almost full
  await checkSystemMemory();

  // Re execute the main thread after some interval
  await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  await mainThread();
};

mainThread().then(() => console.log("LOCAL VCR STARTED"));

// Launch local server for notification
localServerNotifier("3069");

// Let process run in background
daemonizeProcess();
