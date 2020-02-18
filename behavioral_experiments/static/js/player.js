class GamePlayer {
  constructor (gameInstance, playerInstance) {
    this.instance = playerInstance;
    this.game = gameInstance;
    this.role = '';
    this.message = '<p>Waiting for another player...<br/>  \
                       Please do not refresh the page!<br /> \
                       If wait exceeds 5 minutes, we recommend returning the HIT \
                       and trying again later.</p>';
    this.id = '';
  }
};

module.exports = GamePlayer;
