const rooms = []
const MAX_ROOM = 30;

/** roomId:0,
    users:[] */
const socketHelper = {
    addSocket: (socket) => {
        var emptyRoom = rooms.filter((room) => {

            return room.users.length === 1 && !room.started
        }).find(o => true) ?? null;

        if (rooms.length === MAX_ROOM && emptyRoom === null) {
            return {
                success: false,
                message: "Server Full",
                whichUser: -1,
                id: "",
                roomId: -1

            }
        }




        if (emptyRoom === null) {
            var lastRoom = rooms.length !== 0 ? rooms[rooms.length - 1] : null;

            var newRoomId = lastRoom === null ? 0 : lastRoom.id + 1;
            var newRoom = {
                id: newRoomId,
                users: [socket],
                game: ["", "", "", "", "", "", "", "", ""],
                started: false
            }



            rooms.push(newRoom)

            return {
                success: true,
                message: "Join Successful",

                id: socket.id,
                roomId: newRoomId,
                whichUser: 0,



            }

        } else {
            emptyRoom.started = true;
            emptyRoom.users.push(socket)
            return {
                success: true,
                message: "Join Successful",

                id: socket.id,
                roomId: emptyRoom.id,
                whichUser: 1,


            }
        }




    },
    removeSocket: (socket) => {

        var room = rooms.filter((_room) => {


            return _room.users.some((_socket) => {
                return socket.id === _socket.id

            })
        }).find(o => true) ?? null

        if (room === null) {
            return {
                deletedRoom: false,
                success: false,
                room: null
            }
        }
        var deletedRoom = false;
        var userIndex = room.users.indexOf(socket)


        if (userIndex > -1) {
            room.users.splice(userIndex, 1);
            if (room.users.length === 0) {
                deletedRoom = true
                var roomIndex = rooms.indexOf(room)
                if (roomIndex > -1) {
                    rooms.splice(roomIndex, 1)
                }

            }
            return {
                deletedRoom,
                success: true,
                room: room
            }
        }




    },
    getRooms: () => {
        return rooms;
    },
    getRoom: (roomId) => {
        return rooms.filter(_room => _room.id === roomId).find(o => true) ?? null;
    }
}
module.exports = socketHelper