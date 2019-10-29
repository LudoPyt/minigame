import config from './config.js'
import Game from './components/Game.js'

const game = {}
document.addEventListener('keydown', function(event) {
  if (event.keyCode === 13) {
    delete game.instance
    const app = document.getElementById('app')
    game.instance = new Game()
    console.log(game)
}});
