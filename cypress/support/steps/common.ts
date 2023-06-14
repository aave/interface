export const skipState = (initialValue = false) => {
  let _value = initialValue;
  return {
    set: (value: boolean) => {
      _value = value;
    },
    get: () => {
      return _value;
    },
  };
};

type SkipType = {
  set: (val: boolean) => void;
  get: () => boolean;
};

export const skipSetup = ({
  skip,
  updateSkipStatus,
}: {
  skip: SkipType;
  updateSkipStatus: boolean;
}) => {
  before(function () {
    if (skip.get()) {
      this.skip();
    }
    cy.window().then((win) => {
      win.localStorage.setItem('userAcceptedAnalytics', 'false');
    });
  });

  afterEach(function onAfterEach() {
    if ((this.currentTest as Mocha.Test).state === 'failed' && updateSkipStatus) {
      skip.set(true);
    }
    cy.window().then((win) => {
      win.localStorage.setItem('userAcceptedAnalytics', 'false');
    });
  });
};

export const MARKETS = {
  fork_proto_mainnet: 'fork_proto_mainnet',
  fork_amm_mainnet: 'fork_amm_mainnet',
  fork_proto_matic: 'fork_proto_matic',
  fork_proto_avalanche: 'fork_proto_avalanche',
};
