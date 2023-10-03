import qs from 'query-string';
import unfetch from 'isomorphic-unfetch';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { useRouter } from 'next/router';

// var electron = require('electron');
import electron from 'electron';
const ipcRenderer = electron.ipcRenderer || false;

function waitForEvent(emitter, channel) {
  // https://www.derpturkey.com/event-emitter-to-promise/
  return new Promise((resolve) => {
    emitter.once(channel, (event, data) => {
      resolve(data);
    });
  });
}
export const openLink = !ipcRenderer
  ? async (windowName, path, target, options) => {
      const router = useRouter();
    }
  : async (windowName, path, target, options) => {
      const id = nanoid();
      console.log('electron');
      console.log(electron);
      try {
        ipcRenderer.send('create-orders-window', {
          windowName,
          path,
          target,
          options,
        });
      } catch (error) {}
    };
