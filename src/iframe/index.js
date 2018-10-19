(function () {
  const params = new URLSearchParams(location.search);
  const name = params.get("name");
  const image = params.get("image");
  const course = params.get("course");
  const video = params.get("video");

  if (!course) {
    return;
  }

 // TODO: Replace with your own channel ID
  const drone = new ScaleDrone('yiS12Ts5RdNhebyM', {
    data: {
      name,
      image,
    }
  });
  // Scaledrone room name needs to be prefixed with 'observable-'
  const roomName = 'observable-' + course;
  // Scaledrone room used for signaling
  let room;

  // Wait for Scaledrone signalling server to connect
  drone.on('open', error => {
    if (error) {
      return console.error(error);
    }
    room = drone.subscribe(roomName);
    room.on('open', error => {
      if (error) {
        return console.error(error);
      }
      console.log('Connected to server');
    });

    // We're connected to the room and received an array of 'members'
    // connected to the room (including us).
    room.on('members', members => {
      // Create list of users
      console.log('members', members);
    });

    room.on('member_join', member => {
      // notifiy member joining
      console.log('member_join', member);
      insertMessageToDOM({
        name: member.clientData.name,
        content: 'has joined',
        image: member.clientData.image
      });
    });

    room.on('member_leave', member => {
      // notify member leaving
      console.log('member_leave', member);
      insertMessageToDOM({
        name: member.clientData.name,
        content: 'has left',
        image: member.clientData.image
      });
    });

    room.on('data', (data, member) => {
      // data sent by member
      console.log('data', data, member);

      // Message was sent by us
      if (member.id === drone.clientId) {
        return;
      }

      insertMessageToDOM(JSON.parse(data));
    });
  });

  function sendMessage(message) {
    drone.publish({
      room: roomName,
      message
    });
  }

  function insertMessageToDOM(options, isFromMe) {
    const template = document.querySelector('template[data-template="message"]');
    const nameEl = template.content.querySelector('.message__name');
    if (options.image) {
      var imageElem = document.createElement("img");
      imageElem.setAttribute("src", options.image);
      imageElem.setAttribute("height", "32");
      imageElem.setAttribute("width", "32");
      imageElem.setAttribute("alt", options.name);
      nameEl.appendChild(imageElem);
    }
    if (options.name) {
      var nameElem = document.createElement("span");
      nameElem.innerHTML = options.name;
      nameEl.appendChild(nameElem);
    }
    template.content.querySelector('.message__bubble').innerText = options.content;
    const clone = document.importNode(template.content, true);
    const messageEl = clone.querySelector('.message');
    if (isFromMe) {
      messageEl.classList.add('message--mine');
    } else {
      messageEl.classList.add('message--theirs');
    }

    const messagesEl = document.querySelector('.messages');
    messagesEl.appendChild(clone);

    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight - messagesEl.clientHeight;
  }

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('input[type="text"]');
    const value = input.value;
    input.value = '';

    const data = {
      name,
      content: value,
      image,
    };

    sendMessage(JSON.stringify(data));

    insertMessageToDOM(data, true);
    return false;
  });
})();
