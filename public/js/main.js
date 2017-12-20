// set size of canvas
canvas.width = 420;
canvas.height = 450;
// get link on context
const CTX = canvas.getContext('2d');
// set size of game blocks
const BLOCK_W = BLOCK_H = 125;
// font style for all game;
const Font_Style = " Calibri";
// use game Update function
Update();