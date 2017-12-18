//create Game -- 'User1','X','#52FF37'
//                        Name, simbol, color

let game = new Game();
// add MouseListener
game.Mouse(game.User);
game.Update();

// let positionMouse = {};

// canvas.addEventListener('click', () => {
//     positionMouse = {
//         x: window.event.clientX - canvas.getBoundingClientRect().left,
//         y: window.event.clientY - canvas.getBoundingClientRect().top
//     };
//     socket.emit('click', positionMouse);
// });

// socket.on("click", (event) => {
//     console.log(event);
//     ctx.strokeStyle = "green";
//     // x - rect.left, y - rect.top 
//     ctx.rect(event.x, event.y, 50, 50);
//     ctx.stroke();
// });