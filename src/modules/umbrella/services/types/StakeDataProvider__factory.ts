/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  StakeDataProvider,
  StakeDataProviderInterface,
} from "./StakeDataProvider";

const _abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_umbrella",
        type: "address",
        internalType: "contract IUmbrellaStkManager",
      },
      {
        name: "_rewardsController",
        type: "address",
        internalType: "contract IRewardsController",
      },
      {
        name: "_stataTokenFactory",
        type: "address",
        internalType: "contract IStataTokenFactory",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getStakeData",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct StakeData[]",
        components: [
          {
            name: "stakeToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "stakeTokenName",
            type: "string",
            internalType: "string",
          },
          {
            name: "stakeTokenSymbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "stakeTokenTotalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "cooldownSeconds",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "unstakeWindowSeconds",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "stakeTokenUnderlying",
            type: "address",
            internalType: "address",
          },
          {
            name: "underlyingIsWaToken",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "waTokenData",
            type: "tuple",
            internalType: "struct WaTokenData",
            components: [
              {
                name: "waTokenUnderlying",
                type: "address",
                internalType: "address",
              },
              {
                name: "waTokenUnderlyingName",
                type: "string",
                internalType: "string",
              },
              {
                name: "waTokenUnderlyingSymbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "waTokenAToken",
                type: "address",
                internalType: "address",
              },
              {
                name: "waTokenATokenName",
                type: "string",
                internalType: "string",
              },
              {
                name: "waTokenATokenSymbol",
                type: "string",
                internalType: "string",
              },
              {
                name: "waTokenPrice",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "rewards",
            type: "tuple[]",
            internalType: "struct Reward[]",
            components: [
              {
                name: "rewardAddress",
                type: "address",
                internalType: "address",
              },
              {
                name: "index",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "maxEmissionPerSecond",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "distributionEnd",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "currentEmissionPerSecond",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "apy",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "underlyingTokenDecimals",
            type: "uint8",
            internalType: "uint8",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserStakeData",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct StakeUserData[]",
        components: [
          {
            name: "stakeToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "stakeTokenName",
            type: "string",
            internalType: "string",
          },
          {
            name: "balances",
            type: "tuple",
            internalType: "struct StakeUserBalances",
            components: [
              {
                name: "stakeTokenBalance",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "stakeTokenRedeemableAmount",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingTokenBalance",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingWaTokenBalance",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingWaTokenATokenBalance",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "cooldown",
            type: "tuple",
            internalType: "struct StakeUserCooldown",
            components: [
              {
                name: "cooldownAmount",
                type: "uint192",
                internalType: "uint192",
              },
              {
                name: "endOfCooldown",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "withdrawalWindow",
                type: "uint32",
                internalType: "uint32",
              },
            ],
          },
          {
            name: "rewards",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "rewardsAccrued",
            type: "uint256[]",
            internalType: "uint256[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rewardsController",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IRewardsController",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stataTokenFactory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IStataTokenFactory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "umbrella",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IUmbrellaStkManager",
      },
    ],
    stateMutability: "view",
  },
] as const;

const _bytecode =
  "0x60e06040523480156200001157600080fd5b50604051620021e2380380620021e283398101604081905262000034916200006b565b6001600160a01b0392831660805290821660a0521660c052620000bf565b6001600160a01b03811681146200006857600080fd5b50565b6000806000606084860312156200008157600080fd5b83516200008e8162000052565b6020850151909350620000a18162000052565b6040850151909250620000b48162000052565b809150509250925092565b60805160a05160c0516120be620001246000396000818160610152818161020b01526107ad01526000818160a5015281816108aa01528181610a1e01528181610b790152610c1101526000818160cc0152818161012901526106cb01526120be6000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80631494088f1461005c5780636bb65f53146100a057806384914262146100c7578063a16a09af146100ee578063e9ce34a514610103575b600080fd5b6100837f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b6100837f000000000000000000000000000000000000000000000000000000000000000081565b6100837f000000000000000000000000000000000000000000000000000000000000000081565b6100f6610123565b6040516100979190611964565b610116610111366004611aa6565b6106c5565b6040516100979190611b2c565b606060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663de3767766040518163ffffffff1660e01b8152600401600060405180830381865afa158015610185573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526101ad9190810190611d2c565b90506000815167ffffffffffffffff8111156101cb576101cb611c4d565b60405190808252806020026020018201604052801561020457816020015b6101f16116b7565b8152602001906001900390816101e95790505b50905060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663529080176040518163ffffffff1660e01b8152600401600060405180830381865afa158015610267573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261028f9190810190611d2c565b905060005b83518110156106bc5760008482815181106102b1576102b1611d69565b6020026020010151905060008190506000826001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610300573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103249190611d7f565b9050600061033284846109f9565b905060006103408388610d68565b90506040518061016001604052808a888151811061036057610360611d69565b60200260200101516001600160a01b03168152602001866001600160a01b03166306fdde036040518163ffffffff1660e01b8152600401600060405180830381865afa1580156103b4573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526103dc9190810190611d9c565b8152602001866001600160a01b03166395d89b416040518163ffffffff1660e01b8152600401600060405180830381865afa15801561041f573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526104479190810190611d9c565b8152602001866001600160a01b03166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561048a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104ae9190611e27565b8152602001866001600160a01b031663218e4a156040518163ffffffff1660e01b8152600401602060405180830381865afa1580156104f1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105159190611e27565b8152602001866001600160a01b03166390b9f9e46040518163ffffffff1660e01b8152600401602060405180830381865afa158015610558573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061057c9190611e27565b8152602001846001600160a01b0316815260200160006001600160a01b031683600001516001600160a01b0316141515158152602001828152602001838152602001866001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156105fc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106209190611d7f565b6001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa15801561065d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106819190611e40565b60ff1681525088878151811061069957610699611d69565b6020026020010181905250505050505080806106b490611e79565b915050610294565b50909392505050565b606060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663de3767766040518163ffffffff1660e01b8152600401600060405180830381865afa158015610727573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261074f9190810190611d2c565b90506000815167ffffffffffffffff81111561076d5761076d611c4d565b6040519080825280602002602001820160405280156107a657816020015b61079361172b565b81526020019060019003908161078b5790505b50905060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663529080176040518163ffffffff1660e01b8152600401600060405180830381865afa158015610809573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526108319190810190611d2c565b905060005b83518110156109ef57600084828151811061085357610853611d69565b60200260200101519050600061086a8883866110f6565b90506000610878898461137c565b60405160016204621960e51b031981526001600160a01b0385811660048301528b8116602483015291925060009182917f00000000000000000000000000000000000000000000000000000000000000009091169063ff73bce090604401600060405180830381865afa1580156108f3573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261091b9190810190611e92565b915091506040518060c00160405280866001600160a01b03168152602001866001600160a01b03166306fdde036040518163ffffffff1660e01b8152600401600060405180830381865afa158015610977573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261099f9190810190611d9c565b8152602001858152602001848152602001838152602001828152508887815181106109cc576109cc611d69565b6020026020010181905250505050505080806109e790611e79565b915050610836565b5090949350505050565b60405163362a3fad60e01b81526001600160a01b0382811660048301526060916000917f0000000000000000000000000000000000000000000000000000000000000000169063362a3fad90602401600060405180830381865afa158015610a65573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610a8d9190810190611d2c565b90506000815167ffffffffffffffff811115610aab57610aab611c4d565b604051908082528060200260200182016040528015610b1e57816020015b610b0b6040518060c0016040528060006001600160a01b0316815260200160008152602001600081526020016000815260200160008152602001600081525090565b815260200190600190039081610ac95790505b50905060005b8251811015610d5d576000838281518110610b4157610b41611d69565b60209081029190910101516040516334fb3ea160e11b81526001600160a01b03888116600483015280831660248301529192506000917f000000000000000000000000000000000000000000000000000000000000000016906369f67d4290604401608060405180830381865afa158015610bc0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610be49190611f4d565b604051630450881160e51b81526001600160a01b03898116600483015284811660248301529192506000917f00000000000000000000000000000000000000000000000000000000000000001690638a11022090604401602060405180830381865afa158015610c58573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c7c9190611e27565b90506040518060c00160405280846001600160a01b03168152602001836020015181526020018360400151815260200183606001518152602001828152602001610d27838c6001600160a01b03166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610cfe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d229190611e27565b61144e565b815250858581518110610d3c57610d3c611d69565b60200260200101819052505050508080610d5590611e79565b915050610b24565b509150505b92915050565b610d706117b3565b610d7a838361148d565b1561108e576000836001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610dbf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610de39190611d7f565b90506000846001600160a01b031663a0c1f15e6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610e25573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e499190611d7f565b90506040518060e00160405280836001600160a01b03168152602001836001600160a01b03166306fdde036040518163ffffffff1660e01b8152600401600060405180830381865afa158015610ea3573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610ecb9190810190611d9c565b8152602001836001600160a01b03166395d89b416040518163ffffffff1660e01b8152600401600060405180830381865afa158015610f0e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610f369190810190611d9c565b8152602001826001600160a01b03168152602001826001600160a01b03166306fdde036040518163ffffffff1660e01b8152600401600060405180830381865afa158015610f88573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610fb09190810190611d9c565b8152602001826001600160a01b03166395d89b416040518163ffffffff1660e01b8152600401600060405180830381865afa158015610ff3573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261101b9190810190611d9c565b8152602001866001600160a01b03166350d25bcd6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561105e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110829190611e27565b81525092505050610d62565b506040805160e081018252600080825282516020818101855282825280840191909152835180820185528281528385015260608301829052835180820185528281526080840152835190810190935280835260a082019290925260c081019190915292915050565b6111286040518060a0016040528060008152602001600081526020016000815260200160008152602001600081525090565b6000836001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611168573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061118c9190611d7f565b905060008061119c8784876114f2565b6040805160a08101918290526370a0823160e01b9091526001600160a01b038a811660a483015292945090925090819088166370a0823160c48301602060405180830381865afa1580156111f4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112189190611e27565b81526040516370a0823160e01b81526001600160a01b038a81166004830152602090920191891690634cdad5069082906370a0823190602401602060405180830381865afa15801561126e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112929190611e27565b6040518263ffffffff1660e01b81526004016112b091815260200190565b602060405180830381865afa1580156112cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112f19190611e27565b81526040516370a0823160e01b81526001600160a01b038a811660048301526020909201918616906370a0823190602401602060405180830381865afa15801561133f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113639190611e27565b8152602081019390935260409092015295945050505050565b60408051606081018252600080825260208201819052918101919091526040516317c547a160e11b81526001600160a01b03848116600483015260009190841690632f8a8f4290602401606060405180830381865afa1580156113e3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114079190611fd5565b9050604051806060016040528082600001516001600160c01b03168152602001826020015163ffffffff168152602001826040015163ffffffff1681525091505092915050565b60008160000361146057506000610d62565b816127106114726301e133808661204f565b61147c919061204f565b6114869190612066565b9392505050565b6000805b82518110156114e8578281815181106114ac576114ac611d69565b60200260200101516001600160a01b0316846001600160a01b0316036114d6576001915050610d62565b806114e081611e79565b915050611491565b5060009392505050565b6000806114ff848461148d565b156116af576000846001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611544573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115689190611d7f565b90506000856001600160a01b031663a0c1f15e6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156115aa573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115ce9190611d7f565b6040516370a0823160e01b81526001600160a01b038981166004830152919250908316906370a0823190602401602060405180830381865afa158015611618573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061163c9190611e27565b6040516370a0823160e01b81526001600160a01b038981166004830152919550908216906370a0823190602401602060405180830381865afa158015611686573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116aa9190611e27565b925050505b935093915050565b60405180610160016040528060006001600160a01b03168152602001606081526020016060815260200160008152602001600081526020016000815260200160006001600160a01b031681526020016000151581526020016117176117b3565b815260606020820152600060409091015290565b6040518060c0016040528060006001600160a01b031681526020016060815260200161177f6040518060a0016040528060008152602001600081526020016000815260200160008152602001600081525090565b8152604080516060810182526000808252602082810182905292820152910190815260200160608152602001606081525090565b6040518060e0016040528060006001600160a01b03168152602001606081526020016060815260200160006001600160a01b031681526020016060815260200160608152602001600081525090565b60005b8381101561181d578181015183820152602001611805565b50506000910152565b6000815180845261183e816020860160208601611802565b601f01601f19169290920160200192915050565b600060018060a01b03808351168452602083015160e0602086015261187a60e0860182611826565b9050604084015185820360408701526118938282611826565b9150508160608501511660608601526080840151915084810360808601526118bb8183611826565b91505060a083015184820360a08601526118d58282611826565b91505060c083015160c08501528091505092915050565b600081518084526020808501945080840160005b8381101561195957815180516001600160a01b03168852838101518489015260408082015190890152606080820151908901526080808201519089015260a0908101519088015260c09096019590820190600101611900565b509495945050505050565b60006020808301818452808551808352604092508286019150828160051b87010184880160005b83811015611a8057888303603f19018552815180516001600160a01b0316845261016088820151818a8701526119c382870182611826565b91505087820151858203898701526119db8282611826565b606084810151908801526080808501519088015260a0808501519088015260c0808501516001600160a01b03169088015260e08085015115159088015261010080850151888303828a01529193509150611a358382611852565b925050506101208083015186830382880152611a5183826118ec565b92505050610140808301519250611a6c8187018460ff169052565b50958801959350509086019060010161198b565b509098975050505050505050565b6001600160a01b0381168114611aa357600080fd5b50565b600060208284031215611ab857600080fd5b813561148681611a8e565b600081518084526020808501945080840160005b838110156119595781516001600160a01b031687529582019590820190600101611ad7565b600081518084526020808501945080840160005b8381101561195957815187529582019590820190600101611b10565b60006020808301818452808551808352604092508286019150828160051b87010184880160005b83811015611a8057888303603f19018552815180516001600160a01b031684528781015161018089860181905290611b8d82870182611826565b898401518051888c01528b8101516060808a0191909152818c01516080808b01919091528183015160a0808c018290529382015160c08c01528288015180516001600160c01b031660e08d0152602081015163ffffffff9081166101008e0152604090910151166101208c0152818801518b86036101408d01529496509394509091611c198686611ac3565b95508087015196505050505050848103610160860152611c398183611afc565b968901969450505090860190600101611b53565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715611c8c57611c8c611c4d565b604052919050565b600067ffffffffffffffff821115611cae57611cae611c4d565b5060051b60200190565b600082601f830112611cc957600080fd5b81516020611cde611cd983611c94565b611c63565b82815260059290921b84018101918181019086841115611cfd57600080fd5b8286015b84811015611d21578051611d1481611a8e565b8352918301918301611d01565b509695505050505050565b600060208284031215611d3e57600080fd5b815167ffffffffffffffff811115611d5557600080fd5b611d6184828501611cb8565b949350505050565b634e487b7160e01b600052603260045260246000fd5b600060208284031215611d9157600080fd5b815161148681611a8e565b600060208284031215611dae57600080fd5b815167ffffffffffffffff80821115611dc657600080fd5b818401915084601f830112611dda57600080fd5b815181811115611dec57611dec611c4d565b611dff601f8201601f1916602001611c63565b9150808252856020828501011115611e1657600080fd5b610d5d816020840160208601611802565b600060208284031215611e3957600080fd5b5051919050565b600060208284031215611e5257600080fd5b815160ff8116811461148657600080fd5b634e487b7160e01b600052601160045260246000fd5b600060018201611e8b57611e8b611e63565b5060010190565b60008060408385031215611ea557600080fd5b825167ffffffffffffffff80821115611ebd57600080fd5b611ec986838701611cb8565b9350602091508185015181811115611ee057600080fd5b85019050601f81018613611ef357600080fd5b8051611f01611cd982611c94565b81815260059190911b82018301908381019088831115611f2057600080fd5b928401925b82841015611f3e57835182529284019290840190611f25565b80955050505050509250929050565b600060808284031215611f5f57600080fd5b6040516080810181811067ffffffffffffffff82111715611f8257611f82611c4d565b6040528251611f9081611a8e565b808252506020830151602082015260408301516040820152606083015160608201528091505092915050565b805163ffffffff81168114611fd057600080fd5b919050565b600060608284031215611fe757600080fd5b6040516060810181811067ffffffffffffffff8211171561200a5761200a611c4d565b60405282516001600160c01b038116811461202457600080fd5b815261203260208401611fbc565b602082015261204360408401611fbc565b60408201529392505050565b8082028115828204841417610d6257610d62611e63565b60008261208357634e487b7160e01b600052601260045260246000fd5b50049056fea2646970667358221220ef21de45a872bdcb3620ec38833021260333d05894eaebb43051da4ded8898b864736f6c63430008140033";

type StakeDataProviderConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StakeDataProviderConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StakeDataProvider__factory extends ContractFactory {
  constructor(...args: StakeDataProviderConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _umbrella: string,
    _rewardsController: string,
    _stataTokenFactory: string,
    overrides?: Overrides & { from?: string }
  ): Promise<StakeDataProvider> {
    return super.deploy(
      _umbrella,
      _rewardsController,
      _stataTokenFactory,
      overrides || {}
    ) as Promise<StakeDataProvider>;
  }
  override getDeployTransaction(
    _umbrella: string,
    _rewardsController: string,
    _stataTokenFactory: string,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _umbrella,
      _rewardsController,
      _stataTokenFactory,
      overrides || {}
    );
  }
  override attach(address: string): StakeDataProvider {
    return super.attach(address) as StakeDataProvider;
  }
  override connect(signer: Signer): StakeDataProvider__factory {
    return super.connect(signer) as StakeDataProvider__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StakeDataProviderInterface {
    return new utils.Interface(_abi) as StakeDataProviderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StakeDataProvider {
    return new Contract(address, _abi, signerOrProvider) as StakeDataProvider;
  }
}
