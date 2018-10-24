import { getRoom } from "../drone.js";

getRoom().then(({ clientId, room, publish }) => {
  const data = {
    members: []
  };

  // We're connected to the room and received an array of 'members'
  // connected to the room (including us).
  room.on('members', members => {
    // Create list of users
    console.log('members', members);
    data.members = members.map(member => ({ id: member.id, name: member.clientData.name, image: member.clientData.image }));
  });

  room.on('member_join', member => {
    // notifiy member joining
    console.log('member_join', member);
    data.members.push({ id: member.id, name: member.clientData.name, image: member.clientData.image });
  });

  room.on('member_leave', member => {
    // notify member leaving
    console.log('member_leave', member);
    const idx = data.members.findIndex(m => m.id === member.id);
    data.members.splice(idx, 1);
  });

  new Vue({
    data,
    computed: {
      membersCount() {
        return data.members.length;
      }
    }
  }).$mount(".header");
});  
