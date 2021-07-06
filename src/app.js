//require npm packs
const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const socketHelper = require("../src/utils/socketHelper")


const winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

//shortsyntax for reach npms
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const PORT = 3000

const publicDirectoryPath = path.join(__dirname, "../public")
app.use(express.static(publicDirectoryPath))




io.on("connection", (socket) => {
    var addSocketResponse = socketHelper.addSocket(socket)
    if (!addSocketResponse.success) {
        socket.emit("joinFailed", addSocketResponse)

        return;
    }
    socket.emit("joinSuccess", addSocketResponse)

    socket.join(addSocketResponse.roomId);

    if (addSocketResponse.whichUser === 1) {
        io.to(addSocketResponse.roomId).emit("startGame", {})
    }

    socket.on("placeMark", (obj) => {
        var room = socketHelper.getRoom(obj.roomId)
        room.game[obj.dataCellNo] = obj.symbol
        socket.broadcast.to(room.id).emit("otherPlayerPlacedMark", obj)

        var checkGameBoardResponse = checkGameBoard(room.game);
        if (checkGameBoardResponse.finished) {
            io.to(room.id).emit("gameFinished", {
                win: checkGameBoardResponse.win
            })
        }

    })

    socket.on("disconnect", () => {
        var removeSocketResponse = socketHelper.removeSocket(socket)
        if (removeSocketResponse.success) {
            io.to(removeSocketResponse.room.id).emit("playerLeft", {
                username: socket.id
            })
        }
    })
})
server.listen(PORT, () => {
    console.log("Yine de şahlanıyor aman from ", PORT)
})


// const PORT = 3000


function checkGameBoard(game) {
    var returnObj = {
        finished: false
    }
    var emptyCells = game.filter(dataCell=>dataCell==="");
    if(emptyCells.length===0){
        returnObj = {
            finished:true,
            win:"draw"
        }
    }

    winCombinations.forEach(winCombination => {
        var t = "";
        winCombination.forEach(dataCellNo => {
            t += game[dataCellNo];
        })
        if (t === "xxx") {
            returnObj = {
                finished: true,
                win: "x"
            };
            return;
        } else if (t === "circlecirclecircle") {
            returnObj = {
                finished: true,
                win: "circle"
            }
        }
    });
    return returnObj;
}