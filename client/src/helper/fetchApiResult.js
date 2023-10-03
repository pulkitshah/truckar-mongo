import { nanoid } from "nanoid";
import axios from "../utils/axios";

// var electron = require('electron');
import electron from "electron";
const ipcRenderer = electron.ipcRenderer || false;

function waitForEvent(emitter, channel) {
  // https://www.derpturkey.com/event-emitter-to-promise/
  return new Promise((resolve) => {
    emitter.once(channel, (event, data) => {
      resolve(data);
    });
  });
}
export const fetchApiResult = !ipcRenderer
  ? async (url, method, payload) => {
      try {
        const response = await axios[method](
          `http://localhost:3001${url}`,
          payload
        );

        return response;
      } catch (error) {
        if (error.error) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.error);
          throw new Error(error.error);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
          throw new Error("Check Internet Connection");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error);
          throw new Error(
            "Something went wrong. Please contact Customer Support."
          );
        }
      }
    }
  : async (url, method, payload) => {
      const id = nanoid();
      console.log("electron");
      console.log(electron);
      try {
        const response = await axios[method](
          `http://localhost:3001${url}`,
          payload
        );
        return response;
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // throw new Error(error.response.data.error);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
          throw new Error("Check Internet Connection");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
          throw new Error(
            "Something went wrong. Please contact Customer Support."
          );
        }

        // ipcRenderer.send('api', { id, url, method, payload });
        // return await waitForEvent(ipcRenderer, id);
      }
    };
