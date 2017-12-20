let Online = 0;

const User = {
    step: null,
    set: function(data) {
        this.name = data.name;
        this.simbol = data.simbol;
        this.color = data.color;
        this.isMove = data.isMove;
    }
}

const Block = function(x, y, color, index) {

    this.x = x;
    this.y = y;
    this.color = color;
    this.simbol = '';
    this.colorSimbol = null;
    this.isChecked = 0;
    this.index = index;
}

const Grid = {
    stepX: 20,
    stepY: 40,
    isCreated: false,
    storage: [],

    links: [
        [],
        [],
        []
    ],

    set: function(step, simbol, color) {
        this.storage[step].simbol = simbol;
        this.storage[step].colorSimbol = color;
        this.storage[step].isChecked = 1;
        if (simbol != User.simbol) {
            User.isMove = true;
        }

    },
    create: function() {
        this.storage.push(
            new Block(this.stepX, this.stepY, "white", 0),
            new Block(this.stepX + 126, this.stepY, "white", 1),
            new Block(this.stepX + 252, this.stepY, "white", 2),
            new Block(this.stepX, this.stepY + 126, "white", 3),
            new Block(this.stepX + 126, this.stepY + 126, "white", 4),
            new Block(this.stepX + 252, this.stepY + 126, "white", 5),
            new Block(this.stepX, this.stepY + 126 * 2, "white", 6),
            new Block(this.stepX + 126, this.stepY + 126 * 2, "white", 7),
            new Block(this.stepX + 252, this.stepY + 126 * 2, "white", 8)
        );
    },
    show: function() {
        // create once our gred of blocks
        if (!this.isCreated) {
            this.create();
            this.isCreated = true;
        }
        this.storage.map(block => {
            Draw.rect(block.x, block.y, block.color);
            if (block.isChecked == 1)
                Draw.text(block.x + BLOCK_W / 3.3, block.y + BLOCK_H / 1.5, block.colorSimbol, block.simbol)
        });
        //set links
        this.links = [
            [],
            [],
            []
        ];
        let counter = 0,
            index = 0;
        // set all simbol in 3x3 array
        for (let el of this.storage) {
            this.links[[counter]].push(el);
            index++;
            if (index == 3) {
                counter++;
                index = 0;
            }
        }
    }
}

const Draw = {
    CTX: canvas.getContext("2d"),
    rect: function(x, y, color) {
        this.CTX.fillStyle = color;
        this.CTX.fillRect(x, y, BLOCK_W, BLOCK_H);
        this.CTX.fill();
        this.CTX.stroke();
    },

    text: function(x, y, color = "black", text, fontSize = "65pt") {
        this.CTX.font = fontSize + Font_Style;
        this.CTX.fillStyle = color;
        this.CTX.fillText(text, x, y);
        this.CTX.fill();
    },

    online: function(x, y, size = "10pt", color, count) {
        this.CTX.font = size + Font_Style;
        this.CTX.fillStyle = color;
        this.CTX.fillText('Online: ' + count, x, y);
    },

    // color is array of two colors
    move: function(x, y, size = "20pt", color, isMove) {
        this.CTX.font = size + Font_Style;
    },

    win: function() {
        if (User.isWin) {
            if (User.isWin === User.simbol) {
                Draw.text(100, 25, "#3A4671", "You Win!", "25pt");
            } else {
                Draw.text(100, 25, "#9D4671", "You Lose!", "25pt");
            }
            User.gameEnd = true;
        }
    }
}

function Update() {
    CTX.clearRect(0, 0, canvas.width, canvas.height);
    Grid.show();
    let winArr = Logic.isWin();
    if (winArr) {
        winArr.map(el => {
            el.color = "#5F37FF";
        })

        User.isWin = User.simbol;
        socket.emit('win', User.simbol);
    }
    Draw.online(20, 20, "10pt", '#CA6811', Online);

    if (!Draw.win(winArr)) {
        setTimeout(function() {
            requestAnimationFrame(Update);
        }, 1000 / 2);
    }
}

const Logic = {

    checkingPosition: function(data) {
        let counter = 0;
        for (let pos of Grid.storage) {
            if (data.x >= pos.x && data.y >= pos.y &&
                data.x <= pos.x + 125 && data.y <= pos.y + 125) {
                return counter;
            }
            ++counter;
        }
        return counter;
    },
    checkRow: function(arr) {
        return arr.filter(block => block.simbol == User.simbol).length === 3;
    },
    returnWinArr: function(arr) {
        for (let tempArr of arr) {
            if (this.checkRow(tempArr)) {
                return tempArr;
            }
        }
    },
    isWin: function() {
        let winArr = [];
        let tempArr = [
            [],
            [],
            []
        ];
        // 1) check rows
        winArr = this.returnWinArr(Grid.links);
        if (winArr) return winArr;
        // 2) check columns
        Grid.links.map(arr => {
            tempArr[[0]].push(arr[0]);
            tempArr[[1]].push(arr[1]);
            tempArr[[2]].push(arr[2]);
        });
        winArr = this.returnWinArr(tempArr);
        if (winArr) return winArr;
        // 3) check diag
        let left_count = 0,
            right_count = 2,
            diagTemp = [
                [],
                []
            ];

        Grid.links.map(arr => {
            diagTemp[[0]].push(arr[left_count++]);
            diagTemp[[1]].push(arr[right_count--]);
        });
        winArr = this.returnWinArr(diagTemp);
        if (winArr) return winArr;

        return false;
    }
}

window.addEventListener("click", () => {
    let data = {
        x: window.event.clientX - canvas.getBoundingClientRect().left,
        y: window.event.clientY - canvas.getBoundingClientRect().top
    }
    // on what block User Pressed
    let step = Logic.checkingPosition(data);
    // if user pressed in other place - pros will be 10
    // and checking step is empty(0) or not(1)
    if (User.isMove && step < 9 && !Grid.storage[step].isChecked && !User.gameEnd) {
        Grid.set(step, User.simbol, User.color);
        User.isMove = false;
        User.step = step;
        //send to enemy
        socket.emit('click', {
            step: User.step,
            simbol: User.simbol,
            color: User.color
        });
    }
});