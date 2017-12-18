function Game() {

    const ctx = canvas.getContext('2d');
    // ---------------
    const self = this;
    const w = h = 125;
    // screen sittings
    canvas.width = 420;
    canvas.height = 450;
    // step per block
    const stepX = 20,
        stepY = 40;
    let generatePositionForblocks = false;

    self.User = {
        name: '',
        simbol: '',
        color: '',
        userState: true,
        enemyState: false,
        positionOnBlock: null,
        grid: [
            [],
            [],
            []
        ],
        blocksPosition: [],
        online: [],
    };

    // game element
    this.block = function(x, y, start, index) {
        this.x = x, this.y = y;
        this.state = false;
        this.drawRect();
        if (start) {
            this.drawText(
                this.x - 15 + w / 2, this.y + h / 1.6,
                self.User.blocksPosition[index].userSet,
                self.User.blocksPosition[index].color
            );
        }
        if (self.User.blocksPosition.length < 9)
            self.User.blocksPosition.push({ x: this.x, y: this.y, isChecked: 0, userSet: '', color: 'white' });

    }

    this.drawRect = function() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, w, h);
        ctx.fill();
        ctx.stroke();
    }

    this.drawText = function(x, y, simbol, color) {
        ctx.font = "45pt Calibri";
        ctx.fillStyle = color;
        ctx.fillText(simbol, x, y);

    }

    this.drawUser = function() {
        ctx.font = "20pt Calibri";
        //ctx.fillText('User2', 20, 20);
        if (self.User.userState) {
            ctx.fillStyle = "yellow";
            ctx.fillText('Your move!', canvas.width / 3, 20);
        } else {
            ctx.fillStyle = "#FF0011";
            ctx.fillText('Enemy move!', canvas.width / 3, 20);
        }
    }

    self.drawOnline = function() {
        ctx.font = "10pt Calibri";
        ctx.fillStyle = '#CA6811';
        ctx.fillText('online: ' + self.User.online.length, 20, 20 );
    }

    self.field = function() {
        if (!generatePositionForblocks) {
            generatePositionForblocks = true;
            return [
                this.block(stepX, stepY), this.block(stepX + 126, stepY), this.block(stepX + 252, stepY),
                this.block(stepX, stepY + 126), this.block(stepX + 126, stepY + 126), this.block(stepX + 252, stepY + 126),
                this.block(stepX, stepY + 126 * 2), this.block(stepX + 126, stepY + 126 * 2), this.block(stepX + 252, stepY + 126 * 2),
            ];
        } else {
            return self.User.blocksPosition.map((posBlock, index) => {
                this.block(posBlock.x, posBlock.y, true, index);
            });
        }

    }

    self.Update = function() {
        // clear game screen and then will repeat it
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        self.field();
        self.drawUser();
        self.drawOnline();
        // listen mouse events
        setTimeout(function() {
            requestAnimationFrame(self.Update);
        }, 1000 / 2);
    }

    self.setData = function(user, data, pos) {
        if (user.id != self.User.id) {

            self.User.blocksPosition[pos - 1].isChecked = 1;
            self.User.blocksPosition[pos - 1].userSet = user.simbol;
            self.User.blocksPosition[pos - 1].color = user.color;
            self.User.enemyState = false;
            self.User.userState = true;
        } else {
            user.data = data;
            // 1 - 9 blocks, thats why we should add ++
            user.positionOnBlock = pos + 1;
            user.blocksPosition[pos].isChecked = 1;
            user.blocksPosition[pos].userSet = user.simbol;
            user.blocksPosition[pos].color = user.color;
            // info about position
            user.enemyState = true;
            user.userState = false;
        }
        self.checkToWin();
    }

    self.checkToWin = function() {

        let count = i = 0;

        // clear grid
        self.User.grid = [
            [],
            [],
            []
        ];

        // setup grid
        self.User.blocksPosition.map((data) => {
            if (count !== 3) {
                self.User.grid[[i]].push(data.userSet);

            } else {
                self.User.grid[[++i]].push(data.userSet);
                count = 0;
            }
            count++;
        });

        if (self.isIWin()){
            console.log("You win!");
        }
    };

    // return symbol of user who win, or 0 if draw
    self.isIWin = function() {
        let grid = self.User.grid;
        // 1) check rows
        if(self.checkRows(grid)) return true

        // 2) check columns
        let tempArr = [[],[],[]];
        grid.map(arr => {
            tempArr[[0]].push(arr[0]);
            tempArr[[1]].push(arr[1]);
            tempArr[[2]].push(arr[2]);
        });
        if(self.checkRows(tempArr)) return true;
        // 3) check diag
        let left_count  = 0,right_count = 2, diagTemp = [[],[]];
        grid.map(arr => {
            diagTemp[[0]].push(arr[left_count++]);
            diagTemp[[1]].push(arr[right_count--]);
        });
        if(self.checkRows(diagTemp)) return true;

        return false;

    };
    self.checkRows = function (temp) {

        let mySimbol = self.User.simbol;
        if(temp.map(arr => arr.filter(el => el == self.User.simbol))
            .filter(arr => arr.length == 3).length >= 1) return true;
        else return false;
    }


    self.Mouse = function(User) {

        function checkingPosition(data) {
            let counter = 0;
            for (let pos of User.blocksPosition) {
                if (data.x >= pos.x && data.y >= pos.y &&
                    data.x <= pos.x + 125 && data.y <= pos.y + 125) {
                    return counter;
                }
                ++counter;
            }
            return counter;
        }

        window.addEventListener("click", () => {
            let data = {
                x: window.event.clientX - canvas.getBoundingClientRect().left,
                y: window.event.clientY - canvas.getBoundingClientRect().top
            }
            // on what block User Pressed
            let pos = checkingPosition(data);
            // if user pressed in other place - pros will be 10
            // and checking Pos is empty or not
            if (!User.enemyState && pos < 9 && !User.blocksPosition[pos].isChecked) {
                self.setData(User, data, pos);
                socket.emit('click', User);
            }
        });
    }
}