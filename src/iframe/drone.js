const params = new URLSearchParams(location.search);
const name = params.get("name");
const image = params.get("image");
const course = params.get("course");

// TODO: Replace with your own channel ID
const drone = new ScaleDrone('yiS12Ts5RdNhebyM', {
  data: {
    name,
    image,
  }
});
// Scaledrone room name needs to be prefixed with 'observable-'
const roomName = 'observable-' + course;

const publish = message => {
  drone.publish({
    room: roomName,
    message: JSON.stringify(message)
  });
}

const promise = new Promise(resolve => {
  // Wait for Scaledrone signalling server to connect
  drone.on('open', error => {
    if (error) {
      return console.error(error);
    }
    // Scaledrone room used for signaling
    const room = drone.subscribe(roomName);
    room.on('open', error => {
      if (error) {
        return console.error(error);
      }
      console.log('Connected to server');
    });

    resolve({
      clientId: drone.clientId,
      room,
      publish
    });
  });

});

export function getRoom() {
  return promise;
};
