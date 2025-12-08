import { ChainId } from '@aave/contract-helpers';
import { Contract, providers } from 'ethers';
import { zeroAddress } from 'viem';
/**
 * Maps token permit support by chain and token address.
 * Permit enables gasless approvals using signed messages (EIP-2612).
 *
 * To check if a token supports permit, check if the contract has a permit function in the chain's scanner
 * or in the contract's source code.
 *
 * @dev use addresses in lowercase
 */
export const permitByChainAndToken: {
  [ChainId: number]: Record<string, boolean>;
} = {
  [ChainId.mainnet]: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': true, // usdc
    '0x6b175474e89094c44da98b954eedeac495271d0f': false, // dai
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': true, // aave
    '0x514910771af9ca656af840dff83e8264ecf986ca': false, // link
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': false, // wbtc
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': false, // weth
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': true, // wsteth
    '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': true, // gho
    '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': true, // lusd
    '0xdc035d45d973e3ec169d2276ddab16f1e407384f': true, // usds
    '0x14d60e7fdc0d71d8611742720e4c50e7a974020c': true, // uscc superstake underlying_tokenv
    '0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e': true, // ustb underlying_token (aavev3horizon)
    '0x5a0f93d040de44e78f251b03c43be9cf317dcf64': true, // jaaa underlying_token janus henderson andmenum (aave v3 horizon)
    '0x8c213ee79581ff4984583c6a801e5263418c4b86': true, // jtsry underlying_token janus henderson andmenum (aave v3 horizon)
    '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b': true, // usyc underlying_token us yield coin (aavev3horizon)

    // atokens
    '0xb76cf0f1d2e1a606c14044607c8c44878aae7186': true, // adefault
    '0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8': true, // aweth
    '0x252231882fb38481497f3c767469106297c8d93b': true, // aweth_static
    '0x0b925ed163218f6662a35e0f0371ac234f9e9371': true, // awsteth
    '0x322aa5f5be95644d6c36544b6c5061f072d16df5': true, // awsteth_static
    '0x5ee5bf7ae06d1be5997a1a72006fe6c607ec6de8': true, // awbtc
    '0xb07e357cc262e92eee03d8b81464d596b258ea7a': true, // awbtc_static
    '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c': true, // ausdc
    '0x73eddfa87c71addc275c2b9890f5c3a8480bc9e6': true, // ausdc_static
    '0x018008bfb33d285247a21d44e50697654f754e63': true, // adai
    '0xaf270c38ff895ea3f95ed488ceace2386f038249': true, // adai_static
    '0x5e8c8a7243651db1384c0ddfdbe39761e8e7e51a': true, // alink
    '0x57bd8c73838d1781b4f6e0d5cf89eb676488d3df': true, // alink_static
    '0xa700b4eb416be35b2911fd5dee80678ff64ff6c9': true, // aaave
    '0xfeb859a50f92c6d5ad7c9ef7c2c060d164b3280f': true, // aaave_static
    '0x977b6fc5de62598b08c85ac8cf2b745874e8b78c': true, // acbeth
    '0xe2a6863c8f043457b497667ef3c43073e2d69089': true, // acbeth_static
    '0x23878914efe38d27c4d67ab83ed1b93a74d4086a': true, // ausdt
    '0x862c57d48becb45583aeba3f489696d22466ca1b': true, // ausdt_static
    '0xcc9ee9483f662091a1de4795249e24ac0ac2630f': true, // areth
    '0x867cf025b5da438c4e215c60b59bbb3afe896fda': true, // areth_static
    '0x3fe6a295459fae07df8a0cecc36f37160fe86aa9': true, // alusd
    '0xdbf5e36569798d1e39ee9d7b1c61a7409a74f23a': true, // alusd_static
    '0x7b95ec873268a6bfc6427e7a28e396db9d0ebc65': true, // acrv
    '0x149ee12310d499f701b6a5714edad2c832008fd2': true, // acrv_static
    '0x8a458a9dc9048e005d22849f470891b840296619': true, // amkr
    '0xc7b4c17861357b8abb91f25581e7263e08dcb59c': true, // asnx
    '0xaecebdfe454d869a626cab38226c52a1575d1866': true, // asnx_static
    '0x2516e7b3f76294e03c42aa4c5b5b4dce9c436fb8': true, // abal
    '0xf6d2224916ddfbbab6e6bd0d1b7034f4ae0cab18': true, // auni
    '0x78fb5e79d5cb59729d0cd72bea7879ad2683454d': true, // auni_static
    '0x9a44fd41566876a39655f74971a3a6ea0a17a454': true, // aldo
    '0x1ea6e1ba21601258401d0b9db24ea0a07948458e': true, // aldo_static
    '0x545bd6c032efdde65a377a6719def2796c8e0f2e': true, // aens
    '0x2767c27eeaf3566082e74b963b6a0f5c9a46c8a1': true, // aens_static
    '0x71aef7b30728b9bb371578f36c5a1f1502a5723e': true, // aone_inch
    '0xb490ff18e55b8881c9527fe7e358dd363780449f': true, // aone_inch_static
    '0xd4e245848d6e1220dbe62e155d89fa327e43cb06': true, // afrax
    '0xee66abd4d0f9908a48e08ae354b0f425de3e237e': true, // afrax_static
    '0x00907f9921424583e7ffbfedf84f92b7b2be4977': true, // agho
    '0x048459e4fb3402e58d8900af7283ad574b91d742': true, // agho_static
    '0xb76cf92076adbf1d9c39294fa8e7a67579fde357': true, // arpl
    '0x95ef7cb3494e65da4926ba330dbf540a13affd17': true, // arpl_static
    '0x4c612e3b15b96ff9a6faed838f8d07d479a8dd4c': true, // asdai
    '0xfa7e3571786ce9489bbc58d9cb8ece8aae6b56f3': true, // asdai_static
    '0x1ba9843bd4327c6c77011406de5fa8749f7e3479': true, // astg
    '0x5b502e3796385e1e9755d7043b9c945c3accec9c': true, // aknc
    '0x82f9c5ad306bba1ad0de49bb5fa6f01bf61085ef': true, // afxs
    '0xb82fa9f31612989525992fcfbb09ab22eff5c85a': true, // acrvusd
    '0x848107491e029afde0ac543779c7790382f15929': true, // acrvusd_static
    '0x0c0d01abf3e6adfca0989ebba9d6e85dd58eab1e': true, // apyusd
    '0x00f2a835758b33f3ac53516ebd69f3dc77b0d152': true, // apyusd_static
    '0xbdfa7b7893081b35fb54027489e2bc7a38275129': true, // aweeth
    '0x867b0cdc4b39a19945e616c29639b0390b39db3b': true, // aweeth_static
    '0x927709711794f3de5ddbf1d176bee2d55ba13c21': true, // aoseth
    '0xe5248968166206d14ab57345971e32facd839ada': true, // aoseth_static
    '0x4f5923fc5fd4a93352581b38b7cd26943012decf': true, // ausde
    '0x46e5d6a33c8bd8ed38f3c95991c78c9b2ff3bc99': true, // ausde_static
    '0x1c0e06a0b1a4c160c17545ff2a951bfca57c0002': true, // aethx
    '0x7cc6694cf75c18d488d16fb4bf3c71a3b31cc7fb': true, // aethx_static
    '0x4579a27af00a62c0eb156349f31b345c08386419': true, // asusde
    '0x54d612b000697bd8b0094889d7d6a92ba0bf2dea': true, // asusde_static
    '0x10ac93971cdb1f5c778144084242374473c350da': true, // atbtc
    '0x5c647ce0ae10658ec44fa4e11a51c96e94efd1dd': true, // acbbtc
    '0x32a6268f9ba3642dda7892add74f1d34469a4259': true, // ausds
    '0x2d62109243b87c4ba3ee7ba1d91b0dd0a074d7b1': true, // arseth
    '0x65906988adee75306021c417a1a3458040239602': true, // albtc
    '0x5fefd7069a7d91d01f269dade14526ccf3487810': true, // aebtc
    '0xfa82580c16a31d0c1bc632a36f82e83efef3eec0': true, // arlusd
    '0x4b0821e768ed9039a70ed1e80e15e76a5be5df5f': true, // apt_eusde_29may2025
    '0xde6ef6cb4abd3a473ffc2942eef5d84536f8e864': true, // apt_susde_31jul2025
    '0xec4ef66d4fceeba34abb4de69db391bc5476ccc8': true, // ausdtb
    '0x312ffc57778cefa11989733e6e08143e7e229c1c': true, // apt_usde_31jul2025
    '0x2edff5af94334fbd7c38ae318edf1c40e072b73b': true, // apt_eusde_14aug2025
    '0x5f9190496e0dfc831c3bd307978de4a245e2f5cd': true, // aeusde
    '0xcca43cef272c30415866914351fdfc3e881bb7c2': true, // afbtc
    '0xaa6e91c82942aeae040303bf96c15a6dbcb82ca0': true, // aeurc
    '0x5f4a0873a3a02f7c0cb0e13a1d4362a1ad90e751': true, // apt_susde_25sep2025
    '0x38a5357ce55c81add62abc84fb32981e2626adef': true, // apt_usde_25sep2025
    '0x481a2acf3a72ffdc602a9541896ca1db87f86cf7': true, // ateth
    '0x4e2a4d9b3df7aae73b418bd39f3af9e148e3f479': true, // aezeth
    '0x8a2b6f94ff3a89a03e8c02ee92b55af90c9454a2': true, // axaut
    '0x285866acb0d60105b4ed350a463361c2d9afa0e2': true, // apt_susde_27nov2025
    '0x38c503a438185cde29b5cf4dc1442fd6f074f1cc': true, // apt_usde_27nov2025
  },
  [ChainId.arbitrum_one]: {
    '0xf97f4df75117a78c1a5a0dbb814af92458539fb4': true,

    // atokens
    '0x23f2818e62a48e1c19921bd7eca4d278c5ce5a12': true, // adefault
    '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee': true, // adai
    '0xc91c5297d7e161acc74b482aafcc75b85cc0bfed': true, // adai_static
    '0x191c10aa4af7c30e871e70c95db0e4eb77237530': true, // alink
    '0x27de098ef2772386cbcf1a4c8beb886368b7f9a9': true, // alink_static
    '0x625e7708f30ca75bfd92586e17077590c60eb4cd': true, // ausdc
    '0x0bc9e52051f553e75550ca22c196bf132c52cf0b': true, // ausdc_static
    '0x078f358208685046a11c85e8ad32895ded33a249': true, // awbtc
    '0x32b95fbe04e5a51cf99feef4e57cf7e3fc9c5a93': true, // awbtc_static
    '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8': true, // aweth
    '0x352f3475716261dcc991bd5f2af973eb3d0f5878': true, // aweth_static
    '0x6ab707aca953edaefbc4fd23ba73294241490620': true, // ausdt
    '0xb165a74407fe1e519d6bcbdec1ed3202b35a4140': true, // ausdt_static
    '0xf329e36c7bf6e5e86ce2150875a84ce77f477375': true, // aaave
    '0x1c0c8eced17ae093b3c1a1a8ffebe2e9513a9346': true, // aaave_static
    '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97': true, // aeurs
    '0x9a40747be51185a416b181789b671e78a8d045dd': true, // aeurs_static
    '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff': true, // awsteth
    '0x7775d4ae4dbb79a624fb96aacdb8ca74f671c0df': true, // awsteth_static
    '0xc45a479877e1e9dfe9fcd4056c699575a1045daa': true, // amai
    '0xb4a0a2692d82301703b27082cda45b083f68cace': true, // amai_static
    '0x8eb270e296023e9d92081fdf967ddd7878724424': true, // areth
    '0x68235105d6d33a19369d24b746cb7481fb2b34fd': true, // areth_static
    '0x8ffdf2de812095b1d19cb146e4c004587c0a0692': true, // alusd
    '0xdbb6314b5b07e63b7101844c0346309b79f8c20a': true, // alusd_static
    '0x724dc807b04555b71ed48a6896b6f41593b8c637': true, // ausdcn
    '0x7cfadfd5645b50be87d546f42699d863648251ad': true, // ausdcn_static
    '0x38d693ce1df5aadf7bc62595a37d667ad57922e5': true, // afrax
    '0x89aec2023f89e26dbb7eaa7a98fe3996f9d112a8': true, // afrax_static
    '0x6533afac2e7bccb20dca161449a13a32d391fb00': true, // aarb
    '0x9b5637d7952bc9fa2d693aae51f3103760bf2693': true, // aarb_static
    '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77': true, // aweeth
    '0xebe517846d0f36eced99c735cbf6131e1feb775d': true, // agho
    '0xd9fba68d89178e3538e708939332c79efc540179': true, // agho_static
    '0xea1132120ddcdda2f119e99fa7a27a0d036f7ac9': true, // aezeth
    '0x6b030ff3fb9956b1b69f475b77ae0d3cf2cc5afa': true, // arseth
    '0x62fc96b27a510cf4977b59ff952dc32378cc221d': true, // atbtc
  },

  [ChainId.polygon]: {
    '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c': true,
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': false, // usdt (USDT0 polygon)

    // atokens
    '0x17eeff31047d88bc746fd2879db24e35ecf26127': true, // adefault
    '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee': true, // adai
    '0x83c59636e602787a6eebbda2915217b416193fcb': true, // adai_static
    '0x191c10aa4af7c30e871e70c95db0e4eb77237530': true, // alink
    '0x37868a45c6741616f9e5a189dc0481ad70056b6a': true, // alink_static
    '0x625e7708f30ca75bfd92586e17077590c60eb4cd': true, // ausdc
    '0x1017f4a86fc3a3c824346d0b8c5e96a5029bdaf9': true, // ausdc_static
    '0x078f358208685046a11c85e8ad32895ded33a249': true, // awbtc
    '0xbc0f50ccb8514aa7dfeb297521c4bdebc9c7d22d': true, // awbtc_static
    '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8': true, // aweth
    '0xb3d5af0a52a35692d3fcbe37669b3b8c31ddde7d': true, // aweth_static
    '0x6ab707aca953edaefbc4fd23ba73294241490620': true, // ausdt0
    '0x87a1fdc4c726c459f597282be639a045062c0e46': true, // ausdt0_static
    '0xf329e36c7bf6e5e86ce2150875a84ce77f477375': true, // aaave
    '0xca2e1e33e5bcf4978e2d683656e1f5610f8c4a7e': true, // aaave_static
    '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97': true, // awpol
    '0x98254592408e389d1dd2dba318656c2c5c305b4e': true, // awpol_static
    '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff': true, // acrv
    '0x4356941463ed4d75381ac23c9ef799b5d7c52ad8': true, // acrv_static
    '0xc45a479877e1e9dfe9fcd4056c699575a1045daa': true, // asushi
    '0xe3ede71d32240b7ec355f0e5dd1131bbe029f934': true, // asushi_static
    '0x8eb270e296023e9d92081fdf967ddd7878724424': true, // aghst
    '0x123319636a6a9c85d9959399304f4cb23f64327e': true, // aghst_static
    '0x8ffdf2de812095b1d19cb146e4c004587c0a0692': true, // abal
    '0x1a8969fd39abaf228e690b172c4c3eb7c67f95e1': true, // abal_static
    '0x724dc807b04555b71ed48a6896b6f41593b8c637': true, // adpi
    '0x73b788aca5f4f0eeb3c6da453cdf31041a77b36d': true, // adpi_static
    '0x38d693ce1df5aadf7bc62595a37d667ad57922e5': true, // aeurs
    '0x02e26888ed3240bb38f26a2adf96af9b52b167ea': true, // aeurs_static
    '0x6533afac2e7bccb20dca161449a13a32d391fb00': true, // ajeur
    '0xd992dac78ef3f34614e6a7d325b7b6a320fc0ab5': true, // ajeur_static
    '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77': true, // aeura
    '0xd3eb8796ed36f58e03b7b4b5ad417fa74931d2c4': true, // aeura_static
    '0xebe517846d0f36eced99c735cbf6131e1feb775d': true, // amimatic
    '0x8486b49433cced038b51d18ae3772cdb7e31ca5e': true, // amimatic_static
    '0xea1132120ddcdda2f119e99fa7a27a0d036f7ac9': true, // astmatic
    '0x867a180b7060fdc27610dc9096e93534f638a315': true, // astmatic_static
    '0x80ca0d8c38d2e2bcbab66aa1648bd1c7160500fe': true, // amaticx
    '0xbcdd5709641af4be99b1470a2b3a5203539132ec': true, // amaticx_static
    '0xf59036caebea7dc4b86638dfa2e3c97da9fccd40': true, // awsteth
    '0x5274453f4cd5dd7280011a1cca3b9e1b78ec59a6': true, // awsteth_static
    '0xa4d94019934d8333ef880abffbf2fdd611c762bd': true, // ausdcn
    '0x2dca80061632f3f87c9ca28364d1d0c30cd79a19': true, // ausdcn_static
  },
  [ChainId.avalanche]: {
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': true,

    // atokens
    '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee': true, // adaie
    '0x191c10aa4af7c30e871e70c95db0e4eb77237530': true, // alinke
    '0x625e7708f30ca75bfd92586e17077590c60eb4cd': true, // ausdc
    '0x078f358208685046a11c85e8ad32895ded33a249': true, // awbtce
    '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8': true, // awethe
    '0x6ab707aca953edaefbc4fd23ba73294241490620': true, // ausdt
    '0xf329e36c7bf6e5e86ce2150875a84ce77f477375': true, // aaavee
    '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97': true, // awavax
    '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff': true, // asavax
    '0xc45a479877e1e9dfe9fcd4056c699575a1045daa': true, // afrax
    '0x8eb270e296023e9d92081fdf967ddd7878724424': true, // amai
    '0x8ffdf2de812095b1d19cb146e4c004587c0a0692': true, // abtcb
    '0x724dc807b04555b71ed48a6896b6f41593b8c637': true, // aausd
    '0xf611aeb5013fd2c0511c9cd55c7dc5c1140741a6': true, // agho
    '0x8a9fde6925a839f6b1932d16b36ac026f8d3fbdb': true, // aeurc
  },
  [ChainId.optimism]: {
    '0x76fb31fb4af56892a25e32cfc43de717950c9278': false, // aave

    // atokens
    '0x910124b269d81f416d3f6a8767abd575336b4675': true, // adefault
    '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee': true, // adai
    '0x6ddc64289be8a71a707fb057d5d07cc756055d6e': true, // adai_static
    '0x191c10aa4af7c30e871e70c95db0e4eb77237530': true, // alink
    '0x39bcf217acc4bf2fcaf7bc8800e69d986912c75e': true, // alink_static
    '0x625e7708f30ca75bfd92586e17077590c60eb4cd': true, // ausdc
    '0x9f281eb58fd98ad98ede0fc4c553ad4d73e7ca2c': true, // ausdc_static
    '0x078f358208685046a11c85e8ad32895ded33a249': true, // awbtc
    '0x6d998feefc7b3664ead09caf02b5a0fc2e365f18': true, // awbtc_static
    '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8': true, // aweth
    '0x98d69620c31869fd4822ceb6adab31180475fd37': true, // aweth_static
    '0x6ab707aca953edaefbc4fd23ba73294241490620': true, // ausdt
    '0x035c93db04e5aaea54e6cd0261c492a3e0638b37': true, // ausdt_static
    '0xf329e36c7bf6e5e86ce2150875a84ce77f477375': true, // aaave
    '0xae0ca1b1bc6cac26981b5e2b9c40f8ce8a9082ee': true, // aaave_static
    '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97': true, // asusd
    '0x3a956e2fcc7e71ea14b0257d40bebdb287d19652': true, // asusd_static
    '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff': true, // aop
    '0xd4f1cf9a038269fe8f03745c2875591ad6438ab1': true, // aop_static
    '0xc45a479877e1e9dfe9fcd4056c699575a1045daa': true, // awsteth
    '0xb972abef80046a57409e37a7df5def2638917516': true, // awsteth_static
    '0x8eb270e296023e9d92081fdf967ddd7878724424': true, // alusd
    '0x84648dc3cefb601bc28a49a07a1a8bad04d30ad3': true, // alusd_static
    '0x8ffdf2de812095b1d19cb146e4c004587c0a0692': true, // amai
    '0x60495bc8d8baf7e866888ecc00491e37b47dff24': true, // amai_static
    '0x724dc807b04555b71ed48a6896b6f41593b8c637': true, // areth
    '0xf9ce3c97b4b54f3d16861420f4816d9f68190b7b': true, // areth_static
    '0x38d693ce1df5aadf7bc62595a37d667ad57922e5': true, // ausdcn
    '0x4dd03dfd36548c840b563745e3fbec320f37ba7e': true, // ausdcn_static
  },
  [ChainId.zksync]: {
    '0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e': true,
    '0x703b52f2b28febcb60e1372858af5b18849fe867': true,
    '0x493257fd37edb34451f62edf8d2a0c418852ba4c': true,
    '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91': true,

    // atokens
    '0x1c6e9cd0d41da47d90d9118560c04468a1b2dee2': true, // adefault
    '0xe977f9b2a5ccf0457870a67231f23be4daecfbdb': true, // ausdc
    '0xc48574bc5358c967d9447e7df70230fdb469e4e7': true, // ausdt
    '0xb7b93bcf82519bb757fd18b23a389245dbd8ca64': true, // aweth
    '0xd4e607633f3d984633e946aea4eb71f92564c1c9': true, // awsteth
    '0xd6cd2c0fc55936498726cacc497832052a9b2d1b': true, // azk
    '0xe818a67ee5c0531afaa31aa6e20bcac36227a641': true, // aweeth
    '0xf3c9d58b76ac6ee6811520021e9a9318c49e4cfa': true, // asusde
    '0x5722921bb6c37eaeb78b993765aa5d79cc50052f': true, // awrseth
  },
  [ChainId.linea]: {
    '0xa219439258ca9da29e9cc4ce5596924745e12b93': true, // usdt
    '0x2416092f143378750bb29b79ed961ab195cceea5': true, // ezeth
    '0xb5bedd42000b71fdde22d3ee8a79bd49a568fc8f': true, // wsteth

    // atokens
    '0x45338b98572c67c28425bba5af6120719aae8492': true, // adefault
    '0x787897df92703bb3fc4d9ee98e15c0b8130bf163': true, // aweth
    '0x37f7e06359f98162615e016d0008023d910bb576': true, // awbtc
    '0x374d7860c4f2f604de0191298dd393703cce84f3': true, // ausdc
    '0x88231dfec71d4ff5c1e466d08c321944a7adc673': true, // ausdt
    '0x58943d20e010d9e34c4511990e232783460d0219': true, // awsteth
    '0x935efcbefc1df0541afc3fe145134f8c9a0beb89': true, // aezeth
    '0x0c7921ab4888fd06731898b3ffffeb06781d5f4f': true, // aweeth
    '0xcdd80e6211fc767352b198f827200c7e93d7bb04': true, // awrseth
  },
  [ChainId.sonic]: {
    // adding these in false for clarity
    '0x50c42deacd8fc9773493ed674b675be577f2634b': false, // weth
    '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38': false, // ws
    '0x29219dd400f2bf60e5a23d13be72b486d4038894': false, // usdc.e

    // atokens
    '0xe18ab82c81e7eecff32b8a82b1b7d2d23f1ece96': true, // aweth
    '0x578ee1ca3a8e1b54554da1bf7c583506c4cd11c6': true, // ausdc
    '0x6c5e14a212c1c3e4baf6f871ac9b1a969918c131': true, // aws
    '0xeaa74d7f42267eb907092af4bc700f667eed0b8b': true, // asts
  },
  [ChainId.celo]: {
    // '0xceba9300f2b948710d2653dd7b07f33a8b32118c': true, // usdc
    '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e': true, // usdt
    // '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73': true, // ceur
    // '0x765de816845861e75a25fca122bb6898b8b1282a': true, // cusd

    // atokens
    '0x0b89e33cde70fa6fd2cd1c243790b9e19a914927': true, // adefault
    '0xff8309b9e99bfd2d4021bc71a362abd93dbd4785': true, // ausdc
    '0xdee98402a302e4d707fb9bf2bac66faeec31e8df': true, // ausdt
    '0x34c02571094e08e935b8cf8dc10f1ad6795f1f81': true, // aceur
    '0xbba98352628b0b0c4b40583f593ffcb630935a45': true, // acusd
    '0xc3e77dc389537db1eec7c33b95cf3beeca71a209': true, // acelo
    '0xf385280f36e009c157697d25e0b802efabfd789c': true, // aweth
  },
  [ChainId.xdai]: {
    // atokens
    '0xe04bfe47101bbe9aa35f09210589517f04136d23': true, // adefault
    '0xa818f1b57c201e092c4a2017a91815034326efd1': true, // aweth
    '0xd843fb478c5aa9759fea3f3c98d467e2f136190a': true, // aweth_static
    '0x23e4e76d01b2002be436ce8d6044b0aa2f68b68a': true, // awsteth
    '0xecfd0638175e291ba3f784a58fb9d38a25418904': true, // awsteth_static
    '0xa1fa064a85266e2ca82dee5c5ccec84df445760e': true, // agno
    '0x2d737e2b0e175f05d0904c208d6c4e40da570f65': true, // agno_static
    '0xc6b7aca6de8a6044e0e32d0c841a89244a10d284': true, // ausdc
    '0x270ba1f35d8b87510d24f693fccc0da02e6e4eeb': true, // ausdc_static
    '0xd0dd6cef72143e22cced4867eb0d5f2328715533': true, // awxdai
    '0x7f0eae87df30c468e0680c83549d0b3de7664d4b': true, // awxdai_static
    '0xedbc7449a9b594ca4e053d9737ec5dc4cbccbfb2': true, // aeure
    '0x8418d17640a74f1614ac3e1826f29e78714488a1': true, // aeure_static
    '0x7a5c3860a77a8dc1b225bd46d0fb2ac1c6d191bc': true, // asdai
    '0xf3f45960f8de00d8ed614d445a5a268c6f6dec4f': true, // asdai_static
    '0xc0333cb85b59a788d8c7cae5e1fd6e229a3e5a65': true, // ausdce
    '0xf0e7ec247b918311afa054e0aedb99d74c31b809': true, // ausdce_static
    '0x3fdcec11b4f15c79d483aedc56f37d302837cf4d': true, // agho
  },
};

export const isPermitSupported = (chainId: ChainId, tokenAddress: string) => {
  return permitByChainAndToken[chainId]?.[tokenAddress.toLowerCase()] ?? false;
};

const PERMIT_PROBE_ABI = [
  'function nonces(address owner) view returns (uint256)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function domainSeparator() view returns (bytes32)',
  'function EIP712Domain() view returns (bytes memory)',
  'function permit(address, address, uint256, uint256, uint8, bytes32, bytes32)',
  // Optional ERC-20 metadata helpers used for EIP-712 domain inference
  'function name() view returns (string)',
  'function version() view returns (string)',
];

const CACHE_KEY = 'permitCache';
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days
const memoryCache = new Map<string, PermitCacheEntry>();

// ---- Local cache helpers ----
interface PermitCacheEntry {
  supported: boolean;
  timestamp: number;
  name?: string;
  version?: string;
}

const loadCache = (): Record<string, PermitCacheEntry> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveCache = (cache: Record<string, PermitCacheEntry>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
};

const getFromCache = (key: string): boolean | undefined => {
  // SSR fallback
  if (typeof window === 'undefined') return memoryCache.get(key)?.supported;

  const cache = loadCache();
  const entry = cache[key];
  if (!entry) return;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[key];
    saveCache(cache);
    return;
  }

  return entry.supported;
};

const setToCache = (key: string, supported: boolean, name?: string, version?: string) => {
  if (typeof window === 'undefined') {
    memoryCache.set(key, { supported, name, version, timestamp: Date.now() });
    return;
  }

  const cache = loadCache();
  cache[key] = { supported, name, version, timestamp: Date.now() } as PermitCacheEntry;
  saveCache(cache);
};

export const getCachedPermitDomain = (chainId: ChainId, tokenAddress: string) => {
  const key = `${chainId}:${tokenAddress.toLowerCase()}`;
  if (typeof window === 'undefined') {
    const entry = memoryCache.get(key);
    return entry && entry.name ? { name: entry.name, version: entry.version || '1' } : undefined;
  }
  const cache = loadCache();
  const entry = cache[key];
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL) return undefined;
  return entry.name ? { name: entry.name, version: entry.version || '1' } : undefined;
};

export const isPermitSupportedWithFallback = async (
  chainId: ChainId,
  tokenAddress: string,
  provider: providers.Provider
): Promise<boolean> => {
  const key = `${chainId}:${tokenAddress.toLowerCase()}`;

  // 1) Static table
  const staticResult = permitByChainAndToken?.[chainId]?.[tokenAddress.toLowerCase()];
  if (typeof staticResult === 'boolean') return staticResult;

  // 2) Cache
  const cached = getFromCache(key);
  if (cached !== undefined) return cached;

  // 3) On-chain probe
  const contract = new Contract(tokenAddress, PERMIT_PROBE_ABI, provider);

  const tryCall = async (fn: string, args: unknown[] = []) => {
    try {
      await contract[fn](...args);
      return true;
    } catch {
      return false;
    }
  };

  const callString = async (fn: string): Promise<string | undefined> => {
    try {
      const value = await contract[fn]();
      return typeof value === 'string' && value.length > 0 ? value : undefined;
    } catch {
      return undefined;
    }
  };

  const noncesOk = await tryCall('nonces', [zeroAddress]);
  const sepOk =
    (await tryCall('DOMAIN_SEPARATOR')) ||
    (await tryCall('domainSeparator')) ||
    (await tryCall('EIP712Domain'));
  const basicSupported = noncesOk && sepOk;

  if (basicSupported) {
    // Prefer exact domain info; if version is missing, default to '1' (common default)
    const name = await callString('name');
    let version = await callString('version');
    if (name && !version) {
      version = '1';
    }
    if (name && version) {
      setToCache(key, true, name, version);
      return true;
    }
    // Not enough info to build EIP-712 domain safely
    setToCache(key, false);
    return false;
  }
  setToCache(key, false);
  return false;
};

export const customAssetDomains: { [key: string]: { name: string; version: string } } = {
  '0x14d60e7fdc0d71d8611742720e4c50e7a974020c': {
    // USCC AaveV3Horizon
    name: 'Superstate Crypto Carry Fund',
    version: '5',
  },
  '0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e': {
    // USTB AaveV3Horizon
    name: 'Superstate Short Duration US Government Securities Fund',
    version: '5',
  },
  '0x5a0f93d040de44e78f251b03c43be9cf317dcf64': {
    // JAAA AaveV3Horizon
    name: 'Centrifuge',
    version: '1',
  },
  '0x8c213ee79581ff4984583c6a801e5263418c4b86': {
    // JTSRY AaveV3Horizon
    name: 'Centrifuge',
    version: '1',
  },
  '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b': {
    // USYC AaveV3Horizon
    name: 'US Yield Coin',
    version: '2',
  },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    // USDC mainnet
    name: 'USD Coin',
    version: '2',
  },
};
