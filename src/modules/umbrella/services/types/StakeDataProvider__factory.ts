/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from 'ethers';
import type { Provider, TransactionRequest } from '@ethersproject/providers';
import type { StakeDataProvider, StakeDataProviderInterface } from './StakeDataProvider';

const _abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_umbrella',
        type: 'address',
        internalType: 'contract IUmbrellaStkManager',
      },
      {
        name: '_rewardsController',
        type: 'address',
        internalType: 'contract IRewardsController',
      },
      {
        name: '_stataTokenFactory',
        type: 'address',
        internalType: 'contract IStataTokenFactory',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getStakeData',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct StakeData[]',
        components: [
          {
            name: 'stakeToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'stakeTokenName',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'stakeTokenTotalSupply',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'cooldownSeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'unstakeWindowSeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'stakeTokenUnderlying',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'underlyingIsWaToken',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'waTokenData',
            type: 'tuple',
            internalType: 'struct WaTokenData',
            components: [
              {
                name: 'waTokenUnderlying',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'waTokenAToken',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'waTokenPrice',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'rewards',
            type: 'tuple[]',
            internalType: 'struct Reward[]',
            components: [
              {
                name: 'rewardAddress',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'index',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'maxEmissionPerSecond',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'distributionEnd',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'currentEmissionPerSecond',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'apy',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'underlyingTokenDecimals',
            type: 'uint8',
            internalType: 'uint8',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserStakeData',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct StakeUserData[]',
        components: [
          {
            name: 'stakeToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'stakeTokenName',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'balances',
            type: 'tuple',
            internalType: 'struct StakeUserBalances',
            components: [
              {
                name: 'stakeTokenBalance',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'stakeTokenRedeemableAmount',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'underlyingTokenBalance',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'underlyingWaTokenBalance',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'underlyingWaTokenATokenBalance',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'cooldown',
            type: 'tuple',
            internalType: 'struct StakeUserCooldown',
            components: [
              {
                name: 'cooldownAmount',
                type: 'uint192',
                internalType: 'uint192',
              },
              {
                name: 'endOfCooldown',
                type: 'uint32',
                internalType: 'uint32',
              },
              {
                name: 'withdrawalWindow',
                type: 'uint32',
                internalType: 'uint32',
              },
            ],
          },
          {
            name: 'rewards',
            type: 'address[]',
            internalType: 'address[]',
          },
          {
            name: 'rewardsAccrued',
            type: 'uint256[]',
            internalType: 'uint256[]',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardsController',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IRewardsController',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'stataTokenFactory',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IStataTokenFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'umbrella',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IUmbrellaStkManager',
      },
    ],
    stateMutability: 'view',
  },
] as const;

const _bytecode =
  '0x60e060405234801562000010575f80fd5b5060405162001dc738038062001dc7833981016040819052620000339162000069565b6001600160a01b0392831660805290821660a0521660c052620000ba565b6001600160a01b038116811462000066575f80fd5b50565b5f805f606084860312156200007c575f80fd5b8351620000898162000051565b60208501519093506200009c8162000051565b6040850151909250620000af8162000051565b809150509250925092565b60805160a05160c051611cad6200011a5f395f8181605e01528181610262015261077601525f818160a20152818161086a015281816109d501528181610b220152610bb701525f818160c901528181610125015261069a0152611cad5ff3fe608060405234801561000f575f80fd5b5060043610610055575f3560e01c80631494088f146100595780636bb65f531461009d57806384914262146100c4578063a16a09af146100eb578063e9ce34a514610100575b5f80fd5b6100807f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b6100807f000000000000000000000000000000000000000000000000000000000000000081565b6100807f000000000000000000000000000000000000000000000000000000000000000081565b6100f3610120565b6040516100949190611587565b61011361010e3660046116c6565b610695565b6040516100949190611746565b60605f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663de3767766040518163ffffffff1660e01b81526004015f60405180830381865afa15801561017e573d5f803e3d5ffd5b505050506040513d5f823e601f3d908101601f191682016040526101a5919081019061193e565b90505f815167ffffffffffffffff8111156101c2576101c2611865565b60405190808252806020026020018201604052801561025c57816020015b61024960408051610140810182525f808252606060208084018290528385018390528184018390526080840183905260a0840183905260c08401839052845191820185528282528101829052928301529060e08201908152606060208201525f60409091015290565b8152602001906001900390816101e05790505b5090505f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663529080176040518163ffffffff1660e01b81526004015f60405180830381865afa1580156102bb573d5f803e3d5ffd5b505050506040513d5f823e601f3d908101601f191682016040526102e2919081019061193e565b90505f5b835181101561068c575f84828151811061030257610302611978565b602002602001015190505f8190505f826001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561034d573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610371919061198c565b90505f61037e84846109b1565b90505f61038b8388610d0a565b90506040518061014001604052808a88815181106103ab576103ab611978565b60200260200101516001600160a01b03168152602001866001600160a01b03166306fdde036040518163ffffffff1660e01b81526004015f60405180830381865afa1580156103fc573d5f803e3d5ffd5b505050506040513d5f823e601f3d908101601f1916820160405261042391908101906119a7565b8152602001866001600160a01b03166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610464573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906104889190611a2d565b8152602001866001600160a01b031663218e4a156040518163ffffffff1660e01b8152600401602060405180830381865afa1580156104c9573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906104ed9190611a2d565b8152602001866001600160a01b03166390b9f9e46040518163ffffffff1660e01b8152600401602060405180830381865afa15801561052e573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906105529190611a2d565b8152602001846001600160a01b031681526020015f6001600160a01b0316835f01516001600160a01b0316141515158152602001828152602001838152602001866001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156105ce573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906105f2919061198c565b6001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa15801561062d573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906106519190611a44565b60ff1681525088878151811061066957610669611978565b60200260200101819052505050505050808061068490611a78565b9150506102e6565b50909392505050565b60605f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663de3767766040518163ffffffff1660e01b81526004015f60405180830381865afa1580156106f3573d5f803e3d5ffd5b505050506040513d5f823e601f3d908101601f1916820160405261071a919081019061193e565b90505f815167ffffffffffffffff81111561073757610737611865565b60405190808252806020026020018201604052801561077057816020015b61075d611443565b8152602001906001900390816107555790505b5090505f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663529080176040518163ffffffff1660e01b81526004015f60405180830381865afa1580156107cf573d5f803e3d5ffd5b505050506040513d5f823e601f3d908101601f191682016040526107f6919081019061193e565b90505f5b83518110156109a7575f84828151811061081657610816611978565b602002602001015190505f61082c888386610ea8565b90505f610839898461111d565b60405160016204621960e51b031981526001600160a01b0385811660048301528b811660248301529192505f9182917f00000000000000000000000000000000000000000000000000000000000000009091169063ff73bce0906044015f60405180830381865afa1580156108b0573d5f803e3d5ffd5b505050506040513d5f823e601f3d908101601f191682016040526108d79190810190611a90565b915091506040518060c00160405280866001600160a01b03168152602001866001600160a01b03166306fdde036040518163ffffffff1660e01b81526004015f60405180830381865afa158015610930573d5f803e3d5ffd5b505050506040513d5f823e601f3d908101601f1916820160405261095791908101906119a7565b81526020018581526020018481526020018381526020018281525088878151811061098457610984611978565b60200260200101819052505050505050808061099f90611a78565b9150506107fa565b5090949350505050565b60405163362a3fad60e01b81526001600160a01b0382811660048301526060915f917f0000000000000000000000000000000000000000000000000000000000000000169063362a3fad906024015f60405180830381865afa158015610a19573d5f803e3d5ffd5b505050506040513d5f823e601f3d908101601f19168201604052610a40919081019061193e565b90505f815167ffffffffffffffff811115610a5d57610a5d611865565b604051908082528060200260200182016040528015610aca57816020015b610ab76040518060c001604052805f6001600160a01b031681526020015f81526020015f81526020015f81526020015f81526020015f81525090565b815260200190600190039081610a7b5790505b5090505f5b8251811015610cff575f838281518110610aeb57610aeb611978565b60209081029190910101516040516334fb3ea160e11b81526001600160a01b03888116600483015280831660248301529192505f917f000000000000000000000000000000000000000000000000000000000000000016906369f67d4290604401608060405180830381865afa158015610b67573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610b8b9190611b45565b604051630450881160e51b81526001600160a01b03898116600483015284811660248301529192505f917f00000000000000000000000000000000000000000000000000000000000000001690638a11022090604401602060405180830381865afa158015610bfc573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610c209190611a2d565b90506040518060c00160405280846001600160a01b03168152602001836020015181526020018360400151815260200183606001518152602001828152602001610cc9838c6001600160a01b03166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610ca0573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610cc49190611a2d565b6111ea565b815250858581518110610cde57610cde611978565b60200260200101819052505050508080610cf790611a78565b915050610acf565b509150505b92915050565b604080516060810182525f8082526020820181905291810191909152610d308383611226565b15610e85576040518060600160405280846001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610d7c573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610da0919061198c565b6001600160a01b03168152602001846001600160a01b031663a0c1f15e6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610dea573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610e0e919061198c565b6001600160a01b03168152602001846001600160a01b03166350d25bcd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610e58573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610e7c9190611a2d565b90529050610d04565b50604080516060810182525f808252602082018190529181019190915292915050565b610ed56040518060a001604052805f81526020015f81526020015f81526020015f81526020015f81525090565b5f836001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610f12573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610f36919061198c565b90505f80610f45878487611289565b6040805160a08101918290526370a0823160e01b9091526001600160a01b038a811660a483015292945090925090819088166370a0823160c48301602060405180830381865afa158015610f9b573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610fbf9190611a2d565b81526040516370a0823160e01b81526001600160a01b038a81166004830152602090920191891690634cdad5069082906370a0823190602401602060405180830381865afa158015611013573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906110379190611a2d565b6040518263ffffffff1660e01b815260040161105591815260200190565b602060405180830381865afa158015611070573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906110949190611a2d565b81526040516370a0823160e01b81526001600160a01b038a811660048301526020909201918616906370a0823190602401602060405180830381865afa1580156110e0573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906111049190611a2d565b8152602081019390935260409092015295945050505050565b604080516060810182525f80825260208201819052918101919091526040516317c547a160e11b81526001600160a01b0384811660048301525f9190841690632f8a8f4290602401606060405180830381865afa158015611180573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906111a49190611bca565b90506040518060600160405280825f01516001600160c01b03168152602001826020015163ffffffff168152602001826040015163ffffffff1681525091505092915050565b5f815f036111f957505f610d04565b8161271061120b6301e1338086611c41565b6112159190611c41565b61121f9190611c58565b9392505050565b5f805b82518110156112805782818151811061124457611244611978565b60200260200101516001600160a01b0316846001600160a01b03160361126e576001915050610d04565b8061127881611a78565b915050611229565b505f9392505050565b5f806112958484611226565b1561143b575f846001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156112d7573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906112fb919061198c565b90505f856001600160a01b031663a0c1f15e6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561133a573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061135e919061198c565b6040516370a0823160e01b81526001600160a01b038981166004830152919250908316906370a0823190602401602060405180830381865afa1580156113a6573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906113ca9190611a2d565b6040516370a0823160e01b81526001600160a01b038981166004830152919550908216906370a0823190602401602060405180830381865afa158015611412573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906114369190611a2d565b925050505b935093915050565b6040518060c001604052805f6001600160a01b03168152602001606081526020016114916040518060a001604052805f81526020015f81526020015f81526020015f81526020015f81525090565b8152604080516060810182525f808252602082810182905292820152910190815260200160608152602001606081525090565b5f5b838110156114de5781810151838201526020016114c6565b50505f910152565b5f81518084526114fd8160208601602086016114c4565b601f01601f19169290920160200192915050565b5f8151808452602080850194508084015f5b8381101561157c57815180516001600160a01b03168852838101518489015260408082015190890152606080820151908901526080808201519089015260a0908101519088015260c09096019590820190600101611523565b509495945050505050565b5f6020808301818452808551808352604092508286019150828160051b8701018488015f5b838110156116a157888303603f19018552815180516001600160a01b0316845261018088820151818a8701526115e4828701826114e6565b838a0151878b0152606080850151908801526080808501519088015260a0808501516001600160a01b038116828a01529193509150505060c08281015180151587830152505060e08281015180516001600160a01b0390811688840152602082015116610100880152604081015161012088015250506101008201518582036101408701526116738282611511565b915050610120820151915061168e61016086018360ff169052565b95880195935050908601906001016115ac565b509098975050505050505050565b6001600160a01b03811681146116c3575f80fd5b50565b5f602082840312156116d6575f80fd5b813561121f816116af565b5f8151808452602080850194508084015f5b8381101561157c5781516001600160a01b0316875295820195908201906001016116f3565b5f8151808452602080850194508084015f5b8381101561157c5781518752958201959082019060010161172a565b5f6020808301818452808551808352604092508286019150828160051b8701018488015f5b838110156116a157888303603f19018552815180516001600160a01b0316845287810151610180898601819052906117a5828701826114e6565b898401518051888c01528b8101516060808a0191909152818c01516080808b01919091528183015160a0808c018290529382015160c08c01528288015180516001600160c01b031660e08d0152602081015163ffffffff9081166101008e0152604090910151166101208c0152818801518b86036101408d0152949650939450909161183186866116e1565b955080870151965050505050508481036101608601526118518183611718565b96890196945050509086019060010161176b565b634e487b7160e01b5f52604160045260245ffd5b604051601f8201601f1916810167ffffffffffffffff811182821017156118a2576118a2611865565b604052919050565b5f67ffffffffffffffff8211156118c3576118c3611865565b5060051b60200190565b5f82601f8301126118dc575f80fd5b815160206118f16118ec836118aa565b611879565b82815260059290921b8401810191818101908684111561190f575f80fd5b8286015b84811015611933578051611926816116af565b8352918301918301611913565b509695505050505050565b5f6020828403121561194e575f80fd5b815167ffffffffffffffff811115611964575f80fd5b611970848285016118cd565b949350505050565b634e487b7160e01b5f52603260045260245ffd5b5f6020828403121561199c575f80fd5b815161121f816116af565b5f602082840312156119b7575f80fd5b815167ffffffffffffffff808211156119ce575f80fd5b818401915084601f8301126119e1575f80fd5b8151818111156119f3576119f3611865565b611a06601f8201601f1916602001611879565b9150808252856020828501011115611a1c575f80fd5b610cff8160208401602086016114c4565b5f60208284031215611a3d575f80fd5b5051919050565b5f60208284031215611a54575f80fd5b815160ff8116811461121f575f80fd5b634e487b7160e01b5f52601160045260245ffd5b5f60018201611a8957611a89611a64565b5060010190565b5f8060408385031215611aa1575f80fd5b825167ffffffffffffffff80821115611ab8575f80fd5b611ac4868387016118cd565b9350602091508185015181811115611ada575f80fd5b85019050601f81018613611aec575f80fd5b8051611afa6118ec826118aa565b81815260059190911b82018301908381019088831115611b18575f80fd5b928401925b82841015611b3657835182529284019290840190611b1d565b80955050505050509250929050565b5f60808284031215611b55575f80fd5b6040516080810181811067ffffffffffffffff82111715611b7857611b78611865565b6040528251611b86816116af565b808252506020830151602082015260408301516040820152606083015160608201528091505092915050565b805163ffffffff81168114611bc5575f80fd5b919050565b5f60608284031215611bda575f80fd5b6040516060810181811067ffffffffffffffff82111715611bfd57611bfd611865565b60405282516001600160c01b0381168114611c16575f80fd5b8152611c2460208401611bb2565b6020820152611c3560408401611bb2565b60408201529392505050565b8082028115828204841417610d0457610d04611a64565b5f82611c7257634e487b7160e01b5f52601260045260245ffd5b50049056fea2646970667358221220c7c477e40ef6066a8f195b8211f010ba14cb0590758aaa93cc61efa8a7fa853664736f6c63430008140033';

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
  static connect(address: string, signerOrProvider: Signer | Provider): StakeDataProvider {
    return new Contract(address, _abi, signerOrProvider) as StakeDataProvider;
  }
}
