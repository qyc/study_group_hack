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
      members.forEach(member => {
        insertMemberToDOM(member.id, member.clientData.name, member.clientData.image);
      });
    });

    room.on('member_join', member => {
      // notifiy member joining
      console.log('member_join', member);
      insertMemberToDOM(member.id, member.clientData.name, member.clientData.image);
      insertSystemMessageToDOM({
        name: member.clientData.name,
        content: 'has joined',
      });
    });

    room.on('member_leave', member => {
      // notify member leaving
      console.log('member_leave', member);
      removeMemberFromDOM(member.id);
      insertSystemMessageToDOM({
        name: member.clientData.name,
        content: 'has left',
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

  function toggleMembers() {
    const membersEl = document.querySelector(".members");
    membersEl.classList.toggle("members--hidden");
  }

  function sendMessage(message) {
    drone.publish({
      room: roomName,
      message
    });
  }

  function updateMembersCount() {
    const count = document.querySelectorAll('.member').length;
    const countEl = document.querySelector('.header__members');
    countEl.innerText = count + (count > 1 ? ' people' : ' person');
  }

  function insertMemberToDOM(id, name, image) {
    const template = document.querySelector('template[data-template="member"]');

    const memberEl = template.content.querySelector('.member');
    memberEl.dataset.id = id;

    const imageEl = template.content.querySelector('.member__image');
    imageEl.src = image;

    const nameEl = template.content.querySelector('.member__name');
    nameEl.innerText = name;

    const clone = document.importNode(template.content, true);
    const membersEl = document.querySelector('.members');
    membersEl.appendChild(clone);
    updateMembersCount();
  }

  function removeMemberFromDOM(id) {
    const memberEl = document.querySelector('.members .member[data-id="' + id + '"]');
    if (memberEl) {
      memberEl.remove();
    }
    updateMembersCount();
  }

  function insertMessageToDOM(options, isFromMe) {
    const template = document.querySelector('template[data-template="message"]');
    const nameEl = template.content.querySelector('.message__name');
    if (options.image) {
      var imageElem = template.content.querySelector('.message__name__image_tag');
      imageElem.setAttribute("src", options.image);
      imageElem.setAttribute("height", "32");
      imageElem.setAttribute("width", "32");
      imageElem.setAttribute("alt", options.name);
    }
    if (options.name) {
      var nameElem = template.content.querySelector('.message__name__name_tag');
      nameElem.innerHTML = options.name;
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
  function insertSystemMessageToDOM(options) {
    const template = document.querySelector('template[data-template="system--message"]');
    const systemMessageEl = template.content.querySelector('.system--message');
    if (options.name) {
      systemMessageEl.innerText = options.name + ' ' + options.content;
    }
    const clone = document.importNode(template.content, true);
    const messagesEl = document.querySelector('.messages');
    messagesEl.appendChild(clone);

    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight - messagesEl.clientHeight;
  }

  const membersToggle = document.querySelector('.header__members');
  membersToggle.addEventListener('click', toggleMembers);

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
