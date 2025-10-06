
export class Fsm {

    static states = [];
    static currentState = undefined;

    static registerState(name, callback) {

        let state = {
            name: name,
            callback: callback,
        }
        let found = false;
        if (Fsm.states.length > 0) {
            for (let i = 0; i < Fsm.states.length; i++) {
                let state = Fsm.states[i];
                if (state.name === name) {
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            Fsm.states.push(state);
            Fsm.currentState = name;
        }
    }

    static clear() {

        let steps = Fsm.states.length;
        if (steps > 0) {

            for (let i = 0; i < steps; i++) {
                Fsm.states.pop();
            }
        }
    }

    static callCurrentState(nextState) {

        if (Fsm.currentState !== undefined) {

            for (let i = 0; i < Fsm.states.length; i++) {
                let state = Fsm.states[i];

                if (nextState === state.name) {
                    Fsm.currentState = nextState;
                    state.callback();
                    break;
                }
            }
        }
    }
}