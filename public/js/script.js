const socket = io();
const x_class = 'x'
const circle_class = 'circle'
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

const cellElements = document.querySelectorAll('[data-cell]')
const gameStatusMessage = $('#gameStatusMessage')
const winningMessageElement = document.getElementById('winningMessage')
const winningTextMessageTextElement = document.querySelector('[data-winning-message-text]')
const board = document.getElementById('board')
const restartButton = $("#restartButton")
let circleTurn = true
let joinSuccessObj = {}
let gameFinished = false;
const playerStatus = $("#playerStatus")

socket.on("joinSuccess", (joinSuccessResponse) => {
    joinSuccessObj = joinSuccessResponse
})

socket.on("joinFailed", (joinFailedResponse) => {
    alert(joinFailedResponse.message);
    location.replace("/")
})

socket.on("gameFinished", (gameFinishedResponse) => {
    gameFinished = true;
    board.classList.remove(x_class)
    board.classList.remove(circle_class)
    cellElements.forEach(cell => {

        cell.removeEventListener('click', onMarked)
    })
    if (gameFinishedResponse.win === "x") {
        if (joinSuccessObj.whichUser === 0) {
            winningTextMessageTextElement.innerText = `KAZANDIN KEKE`
        } else {
            winningTextMessageTextElement.innerText = `KAYBETTİN KEKE`
        }
    } else if (gameFinishedResponse.win === "circle") {
        if (joinSuccessObj.whichUser === 0) {
            winningTextMessageTextElement.innerText = `KAYBETTİN KEKE`
        } else {
            winningTextMessageTextElement.innerText = `KAZANDIN KEKE`
        }
    } else {
        winningTextMessageTextElement.innerText = `BERABERE KEKELER`
    }

    winningMessageElement.classList.add('show')
})

socket.on("startGame", (startGameResponse) => {
    board.classList.remove("hide")
    if (joinSuccessObj.whichUser === 0) {
        gameStatusMessage.html("Siz Başlıyorsunuz")
        startGame()
    } else {
        gameStatusMessage.html("Rakip Başlıyor")

    }
})
socket.on("otherPlayerPlacedMark", obj => {
    var markedCell = $('[data-cell="' + obj.dataCellNo + '"]')
    markedCell.addClass(obj.symbol)
    gameStatusMessage.html("Siz Oynuyorsunuz")
    cellElements.forEach(cell => {
        cell.removeEventListener('click', onMarked)
        cell.addEventListener('click', onMarked)
        setBoardHoverClass()
    })
});

socket.on("playerLeft", (a) => {
    if (!gameFinished) {
        alert("Adamı öldü aq")
        location.replace("/")
    }
})

restartButton.on("click", () => {
    location.replace("/")
})

function startGame() {

    circleTurn = false
    if (joinSuccessObj.whichUser === 0) {
        cellElements.forEach(cell => {
            cell.classList.remove(x_class)
            cell.classList.remove(circle_class)
            cell.removeEventListener('click', onMarked)
            cell.addEventListener('click', onMarked)
        })
        setBoardHoverClass()
        winningMessageElement.classList.remove('show')
    }
}


function onMarked(e) {
    const cell = e.target
    placeMark(cell, joinSuccessObj.whichUser === 0 ? x_class : circle_class)
    // if (checkWin(currentClass)) {
    //     endGame(false)

    // } else if (isDraw()) {
    //     endGame(true)
    // } else {
    //     swapTurns()
    //     setBoardHoverClass()

    // }
}
const endGame = (draw) => {
    if (draw) {
        winningTextMessageTextElement.innerText = "Draw!"


    } else {
        winningTextMessageTextElement.innerText = `${circleTurn ? "O's":"X' "} Wins!`
    }
    winningMessageElement.classList.add('show')
}

const isDraw = () => {
    return [...cellElements].every(cell => {
        return cell.classList.contains(x_class) || cell.classList.contains(circle_class)
    })
}

function placeMark(cell, currentClass) {
    if (cell.classList.contains("x") || cell.classList.contains("circle")) {
        return;
    }
    var dataCellNo = cell.getAttribute("data-cell")
    socket.emit("placeMark", {
        dataCellNo,
        roomId: joinSuccessObj.roomId,
        symbol: currentClass
    })
    gameStatusMessage.html("Rakip Oynuyor")

    cell.classList.add(currentClass)
    board.classList.remove(x_class)
    board.classList.remove(circle_class)
    cellElements.forEach(cell => {

        cell.removeEventListener('click', onMarked)
    })
}

function swapTurns() {
    circleTurn = !circleTurn
}

function setBoardHoverClass() {
    board.classList.remove(x_class)
    board.classList.remove(circle_class)
    board.classList.add(joinSuccessObj.whichUser === 0 ? x_class : circle_class)
}
const checkWin = (currentClass) => {
    return winCombinations.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass)
        })
    })
}