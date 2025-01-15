/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { StakeGateway, StakeGatewayInterface } from "./StakeGateway";

const _abi = [
  {
    type: "constructor",
    inputs: [
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
    name: "stake",
    inputs: [
      {
        name: "stakeToken",
        type: "address",
        internalType: "contract IERC4626StakeToken",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakeATokens",
    inputs: [
      {
        name: "stakeToken",
        type: "address",
        internalType: "contract IERC4626StakeToken",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakeATokensWithPermit",
    inputs: [
      {
        name: "stakeToken",
        type: "address",
        internalType: "contract IERC4626StakeToken",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stakeWithPermit",
    inputs: [
      {
        name: "stakeToken",
        type: "address",
        internalType: "contract IERC4626StakeToken",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b50604051610e2b380380610e2b83398101604081905261002f91610040565b6001600160a01b0316608052610070565b60006020828403121561005257600080fd5b81516001600160a01b038116811461006957600080fd5b9392505050565b608051610d856100a660003960008181606101528181610176015281816104a50152818161077201526109d10152610d856000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80631494088f1461005c5780634868658f1461009f57806373d6a889146100b4578063adc9772e146100c7578063dd8866b7146100da575b600080fd5b6100837f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200160405180910390f35b6100b26100ad366004610c21565b6100ed565b005b6100b26100c2366004610c21565b61041c565b6100b26100d5366004610c83565b6106e9565b6100b26100e8366004610c83565b610948565b6000866001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561012d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101519190610caf565b6040516369853e0360e11b81526001600160a01b0380831660048301529192506000917f0000000000000000000000000000000000000000000000000000000000000000169063d30a7c0690602401602060405180830381865afa1580156101bd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e19190610caf565b90506000816001600160a01b031663a0c1f15e6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610223573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102479190610caf565b905060001988036102bd576040516370a0823160e01b81523360048201526001600160a01b038216906370a0823190602401602060405180830381865afa158015610296573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ba9190610cd3565b97505b60405163d505accf60e01b81526001600160a01b0382169063d505accf906102f590339030908d908d908d908d908d90600401610cec565b600060405180830381600087803b15801561030f57600080fd5b505af1158015610323573d6000803e3d6000fd5b505060405163e25ec34960e01b8152600481018b9052306024820152600092506001600160a01b038516915063e25ec349906044016020604051808303816000875af1158015610377573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061039b9190610cd3565b604051636e553f6560e01b8152600481018290523360248201529091506001600160a01b038b1690636e553f65906044016020604051808303816000875af11580156103eb573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061040f9190610cd3565b5050505050505050505050565b6000866001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561045c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104809190610caf565b6040516369853e0360e11b81526001600160a01b0380831660048301529192506000917f0000000000000000000000000000000000000000000000000000000000000000169063d30a7c0690602401602060405180830381865afa1580156104ec573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105109190610caf565b60405163d505accf60e01b81529091506001600160a01b0383169063d505accf9061054b90339030908c908c908c908c908c90600401610cec565b600060405180830381600087803b15801561056557600080fd5b505af1158015610579573d6000803e3d6000fd5b50506040516323b872dd60e01b8152336004820152306024820152604481018a90526001600160a01b03851692506323b872dd91506064016020604051808303816000875af11580156105d0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105f49190610d2d565b50604051636e553f6560e01b8152600481018890523060248201526000906001600160a01b03831690636e553f65906044016020604051808303816000875af1158015610645573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106699190610cd3565b604051636e553f6560e01b8152600481018290523360248201529091506001600160a01b038a1690636e553f65906044016020604051808303816000875af11580156106b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106dd9190610cd3565b50505050505050505050565b6000826001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610729573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061074d9190610caf565b6040516369853e0360e11b81526001600160a01b0380831660048301529192506000917f0000000000000000000000000000000000000000000000000000000000000000169063d30a7c0690602401602060405180830381865afa1580156107b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107dd9190610caf565b6040516323b872dd60e01b8152336004820152306024820152604481018590529091506001600160a01b038316906323b872dd906064016020604051808303816000875af1158015610833573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108579190610d2d565b50604051636e553f6560e01b8152600481018490523060248201526000906001600160a01b03831690636e553f65906044016020604051808303816000875af11580156108a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108cc9190610cd3565b604051636e553f6560e01b8152600481018290523360248201529091506001600160a01b03861690636e553f65906044016020604051808303816000875af115801561091c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109409190610cd3565b505050505050565b6000826001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610988573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109ac9190610caf565b6040516369853e0360e11b81526001600160a01b0380831660048301529192506000917f0000000000000000000000000000000000000000000000000000000000000000169063d30a7c0690602401602060405180830381865afa158015610a18573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a3c9190610caf565b90506000816001600160a01b031663a0c1f15e6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a7e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aa29190610caf565b90506000198403610b18576040516370a0823160e01b81523360048201526001600160a01b038216906370a0823190602401602060405180830381865afa158015610af1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b159190610cd3565b93505b60405163e25ec34960e01b8152600481018590523060248201526000906001600160a01b0384169063e25ec349906044016020604051808303816000875af1158015610b68573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b8c9190610cd3565b604051636e553f6560e01b8152600481018290523360248201529091506001600160a01b03871690636e553f65906044016020604051808303816000875af1158015610bdc573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c009190610cd3565b50505050505050565b6001600160a01b0381168114610c1e57600080fd5b50565b60008060008060008060c08789031215610c3a57600080fd5b8635610c4581610c09565b95506020870135945060408701359350606087013560ff81168114610c6957600080fd5b9598949750929560808101359460a0909101359350915050565b60008060408385031215610c9657600080fd5b8235610ca181610c09565b946020939093013593505050565b600060208284031215610cc157600080fd5b8151610ccc81610c09565b9392505050565b600060208284031215610ce557600080fd5b5051919050565b6001600160a01b0397881681529590961660208601526040850193909352606084019190915260ff16608083015260a082015260c081019190915260e00190565b600060208284031215610d3f57600080fd5b81518015158114610ccc57600080fdfea264697066735822122028e1f48bca56775964a55029f8b38bc74c1c720cb0aee439c3b916647587611e64736f6c63430008140033";

type StakeGatewayConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StakeGatewayConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StakeGateway__factory extends ContractFactory {
  constructor(...args: StakeGatewayConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _stataTokenFactory: string,
    overrides?: Overrides & { from?: string }
  ): Promise<StakeGateway> {
    return super.deploy(
      _stataTokenFactory,
      overrides || {}
    ) as Promise<StakeGateway>;
  }
  override getDeployTransaction(
    _stataTokenFactory: string,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(_stataTokenFactory, overrides || {});
  }
  override attach(address: string): StakeGateway {
    return super.attach(address) as StakeGateway;
  }
  override connect(signer: Signer): StakeGateway__factory {
    return super.connect(signer) as StakeGateway__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StakeGatewayInterface {
    return new utils.Interface(_abi) as StakeGatewayInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StakeGateway {
    return new Contract(address, _abi, signerOrProvider) as StakeGateway;
  }
}
