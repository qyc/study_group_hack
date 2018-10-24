import { getRoom } from "../drone.js";

getRoom().then(({ clientId, room, publish }) => {
  let vm = new Vue({
    data: {}
  });
});  
