import { getRoom } from "../drone.js";

const STATE = {
  WAITING: "WAITING",
  READY: "READY",
  IN_SESSION: "IN_SESSION",
  COMPLETE: "COMPLETE"
};

getRoom().then(({ clientId, room, publish }) => {
  const data = {
    state: STATE.WAITING,
    members: [],
    emojis: ["👍", "👎", "❤️", "❓"],
    progress: 0,
    reactions: []
  };

  const memberById = id => {
    return data.members.find(m => m.id === id);
  }

  const progressHandler = (function () {
    let interval;
    return {
      start() {
        if (interval) {
          clearInterval(interval);
        }
        data.progress = 0;
        interval = setInterval(() => {
          data.progress += 1;
          if (data.progress > 100) {
            clearInterval(interval);
          }
        }, 100);
      }
    }
  })();

  const publisher = {
    ready() {
      publish({ type: "ready" });
    },
    react(emoji, progress) {
      publish({ type: "react", emoji, progress });
    },
    discuss(reaction) {
      publish({ type: "discuss", reaction });
    }
  };

  const createVue = () => {
    new Vue({
      data,
      computed: {
        self() {
          return memberById(clientId);
        },
        amReady() {
          return this.self.ready;
        }
      },
      methods: {
        memberImage(id) {
          return memberById(id).image;
        },
        ready() {
          publisher.ready();
        },
        start() {
          this.state = STATE.IN_SESSION;
          progressHandler.start();
        },
        react(emoji) {
          publisher.react(emoji, this.progress);
        },
        discuss(reaction) {
          publisher.discuss(reaction);
        }
      }
    }).$mount(".header");
  };

  // We're connected to the room and received an array of 'members'
  // connected to the room (including us).
  room.on('members', members => {
    // Create list of users
    console.log('members', members);
    data.members = members.map(member => ({
      id: member.id,
      name: member.clientData.name,
      image: member.clientData.image,
      ready: false
    }));
    createVue();
  });

  room.on('member_join', member => {
    // notifiy member joining
    console.log('member_join', member);
    data.members.push({
      id: member.id,
      name: member.clientData.name,
      image: member.clientData.image,
      ready: false
    });
  });

  room.on('member_leave', member => {
    // notify member leaving
    console.log('member_leave', member);
    const idx = data.members.findIndex(m => m.id === member.id);
    data.members.splice(idx, 1);
  });

  room.on('data', (d, member) => {
    console.log("game data", d, member);
    d = JSON.parse(d);
    switch (d.type) {
      case "ready":
        memberById(member.id).ready = true;
        break;
      case "react":
        data.reactions.push({
          id: member.id,
          emoji: d.emoji,
          progress: d.progress
        });
        break;
    }
  });
});  