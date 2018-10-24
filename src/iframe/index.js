import { getRoom } from "./drone.js";

getRoom().then(({ clientId, room, publish }) => {
  const params = new URLSearchParams(location.search);
  const name = params.get("name");
  const image = params.get("image");
  const course = params.get("course");
  const video = params.get("video");

  if (!course) {
    return;
  }

  room.on('member_join', member => {
    // notifiy member joining
    console.log('member_join', member);
    insertSystemMessageToDOM({
      name: member.clientData.name,
      content: 'has joined',
    });
  });

  room.on('member_leave', member => {
    // notify member leaving
    console.log('member_leave', member);
    insertSystemMessageToDOM({
      name: member.clientData.name,
      content: 'has left',
    });
  });

  room.on('data', (data, member) => {
    data = JSON.parse(data);
    switch (data.type) {
      case 'message':
        // data sent by member
        console.log('data', data, member);

        // Message was sent by us
        if (member.id === clientId) {
          return;
        }

        insertMessageToDOM(data);
        break;

      case 'discuss':
        // data sent by member
        console.log('data', data, member);
        insertSystemMessageToDOM({
          content: `Let's discuss ${data.reaction.emoji} @ ${data.reaction.progress}`
        });
        break;
    }
  });

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
    let text = '';
    if (options.name) {
      text = options.name + ' ';
    }
    text += options.content;
    systemMessageEl.innerText = text;
    const clone = document.importNode(template.content, true);
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
      type: 'message',
      name,
      content: value,
      image,
    };

    publish(data);

    insertMessageToDOM(data, true);
    return false;
  });
});
