let InitModule = function (ctx, logger, nk, initializer) {

  initializer.registerMatch("tic-tac-toe", {
    matchInit: function (ctx, logger, nk, params) {
      return {
        state: {
          board: Array(9).fill(null),
          turn: "X",
          players: []
        },
        tickRate: 1,
        label: "TicTacToe"
      };
    },

    matchJoinAttempt: function (ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
      if (state.players.length >= 2) {
        return { state, accept: false };
      }
      return { state, accept: true };
    },

    matchJoin: function (ctx, logger, nk, dispatcher, tick, state, presences) {
      presences.forEach(p => state.players.push(p));

      dispatcher.broadcastMessage(1, {
        board: state.board,
        turn: state.turn
      });

      return { state };
    },

    matchLoop: function (ctx, logger, nk, dispatcher, tick, state, messages) {
      messages.forEach(msg => {
        let data = JSON.parse(msg.data);

        let { index } = data;

        // ❗ SERVER VALIDATION
        if (state.board[index] !== null) return;

        state.board[index] = state.turn;

        // switch turn
        state.turn = state.turn === "X" ? "O" : "X";

        dispatcher.broadcastMessage(1, {
          board: state.board,
          turn: state.turn
        });
      });

      return { state };
    }
  });
};

module.exports = { InitModule };
