import { ChainId } from '@aave/contract-helpers';

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
  [chainId: number]: Record<string, boolean>;
} = {
  [ChainId.mainnet]: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': false, // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': false, // DAI
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': true, // AAVE
    '0x514910771af9ca656af840dff83e8264ecf986ca': false, // LINK
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': false, // WBTC
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': false, // WETH
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': true, // wstETH
    '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': true, // GHO
    '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': true, // LUSD
    '0xdc035d45d973e3ec169d2276ddab16f1e407384f': true, // USDS
    '0x14d60e7fdc0d71d8611742720e4c50e7a974020c': true, // USCC superstake underlying_tokenv
    '0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e': true, // USTB underlying_token (AaveV3Horizon)
    '0x5a0f93d040de44e78f251b03c43be9cf317dcf64': true, // JAAA underlying_token Janus Henderson Andmenum (Aave V3 Horizon)
    '0x8c213ee79581ff4984583c6a801e5263418c4b86': true, // JTSRY underlying_token Janus Henderson Andmenum (Aave V3 Horizon)
    '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b': true, // USYC underlying_token US Yield Coin (AaveV3Horizon)

    // aTokens
    '0xb76cf0f1d2e1a606c14044607c8c44878aae7186': true, // aDEFAULT
    '0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8': true, // aWETH
    '0x252231882fb38481497f3c767469106297c8d93b': true, // aWETH_STATIC
    '0x0b925ed163218f6662a35e0f0371ac234f9e9371': true, // awstETH
    '0x322aa5f5be95644d6c36544b6c5061f072d16df5': true, // awstETH_STATIC
    '0x5ee5bf7ae06d1be5997a1a72006fe6c607ec6de8': true, // aWBTC
    '0xb07e357cc262e92eee03d8b81464d596b258ea7a': true, // aWBTC_STATIC
    '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c': true, // aUSDC
    '0x73eddfa87c71addc275c2b9890f5c3a8480bc9e6': true, // aUSDC_STATIC
    '0x018008bfb33d285247a21d44e50697654f754e63': true, // aDAI
    '0xaf270c38ff895ea3f95ed488ceace2386f038249': true, // aDAI_STATIC
    '0x5e8c8a7243651db1384c0ddfdbe39761e8e7e51a': true, // aLINK
    '0x57bd8c73838d1781b4f6e0d5cf89eb676488d3df': true, // aLINK_STATIC
    '0xa700b4eb416be35b2911fd5dee80678ff64ff6c9': true, // aAAVE
    '0xfeb859a50f92c6d5ad7c9ef7c2c060d164b3280f': true, // aAAVE_STATIC
    '0x977b6fc5de62598b08c85ac8cf2b745874e8b78c': true, // acbETH
    '0xe2a6863c8f043457b497667ef3c43073e2d69089': true, // acbETH_STATIC
    '0x23878914efe38d27c4d67ab83ed1b93a74d4086a': true, // aUSDT
    '0x862c57d48becb45583aeba3f489696d22466ca1b': true, // aUSDT_STATIC
    '0xcc9ee9483f662091a1de4795249e24ac0ac2630f': true, // arETH
    '0x867cf025b5da438c4e215c60b59bbb3afe896fda': true, // arETH_STATIC
    '0x3fe6a295459fae07df8a0cecc36f37160fe86aa9': true, // aLUSD
    '0xdbf5e36569798d1e39ee9d7b1c61a7409a74f23a': true, // aLUSD_STATIC
    '0x7b95ec873268a6bfc6427e7a28e396db9d0ebc65': true, // aCRV
    '0x149ee12310d499f701b6a5714edad2c832008fd2': true, // aCRV_STATIC
    '0x8a458a9dc9048e005d22849f470891b840296619': true, // aMKR
    '0xc7b4c17861357b8abb91f25581e7263e08dcb59c': true, // aSNX
    '0xaecebdfe454d869a626cab38226c52a1575d1866': true, // aSNX_STATIC
    '0x2516e7b3f76294e03c42aa4c5b5b4dce9c436fb8': true, // aBAL
    '0xf6d2224916ddfbbab6e6bd0d1b7034f4ae0cab18': true, // aUNI
    '0x78fb5e79d5cb59729d0cd72bea7879ad2683454d': true, // aUNI_STATIC
    '0x9a44fd41566876a39655f74971a3a6ea0a17a454': true, // aLDO
    '0x1ea6e1ba21601258401d0b9db24ea0a07948458e': true, // aLDO_STATIC
    '0x545bd6c032efdde65a377a6719def2796c8e0f2e': true, // aENS
    '0x2767c27eeaf3566082e74b963b6a0f5c9a46c8a1': true, // aENS_STATIC
    '0x71aef7b30728b9bb371578f36c5a1f1502a5723e': true, // aONE_INCH
    '0xb490ff18e55b8881c9527fe7e358dd363780449f': true, // aONE_INCH_STATIC
    '0xd4e245848d6e1220dbe62e155d89fa327e43cb06': true, // aFRAX
    '0xee66abd4d0f9908a48e08ae354b0f425de3e237e': true, // aFRAX_STATIC
    '0x00907f9921424583e7ffbfedf84f92b7b2be4977': true, // aGHO
    '0x048459e4fb3402e58d8900af7283ad574b91d742': true, // aGHO_STATIC
    '0xb76cf92076adbf1d9c39294fa8e7a67579fde357': true, // aRPL
    '0x95ef7cb3494e65da4926ba330dbf540a13affd17': true, // aRPL_STATIC
    '0x4c612e3b15b96ff9a6faed838f8d07d479a8dd4c': true, // asDAI
    '0xfa7e3571786ce9489bbc58d9cb8ece8aae6b56f3': true, // asDAI_STATIC
    '0x1ba9843bd4327c6c77011406de5fa8749f7e3479': true, // aSTG
    '0x5b502e3796385e1e9755d7043b9c945c3accec9c': true, // aKNC
    '0x82f9c5ad306bba1ad0de49bb5fa6f01bf61085ef': true, // aFXS
    '0xb82fa9f31612989525992fcfbb09ab22eff5c85a': true, // acrvUSD
    '0x848107491e029afde0ac543779c7790382f15929': true, // acrvUSD_STATIC
    '0x0c0d01abf3e6adfca0989ebba9d6e85dd58eab1e': true, // aPYUSD
    '0x00f2a835758b33f3ac53516ebd69f3dc77b0d152': true, // aPYUSD_STATIC
    '0xbdfa7b7893081b35fb54027489e2bc7a38275129': true, // aweETH
    '0x867b0cdc4b39a19945e616c29639b0390b39db3b': true, // aweETH_STATIC
    '0x927709711794f3de5ddbf1d176bee2d55ba13c21': true, // aosETH
    '0xe5248968166206d14ab57345971e32facd839ada': true, // aosETH_STATIC
    '0x4f5923fc5fd4a93352581b38b7cd26943012decf': true, // aUSDe
    '0x46e5d6a33c8bd8ed38f3c95991c78c9b2ff3bc99': true, // aUSDe_STATIC
    '0x1c0e06a0b1a4c160c17545ff2a951bfca57c0002': true, // aETHx
    '0x7cc6694cf75c18d488d16fb4bf3c71a3b31cc7fb': true, // aETHx_STATIC
    '0x4579a27af00a62c0eb156349f31b345c08386419': true, // asUSDe
    '0x54d612b000697bd8b0094889d7d6a92ba0bf2dea': true, // asUSDe_STATIC
    '0x10ac93971cdb1f5c778144084242374473c350da': true, // atBTC
    '0x5c647ce0ae10658ec44fa4e11a51c96e94efd1dd': true, // acbBTC
    '0x32a6268f9ba3642dda7892add74f1d34469a4259': true, // aUSDS
    '0x2d62109243b87c4ba3ee7ba1d91b0dd0a074d7b1': true, // arsETH
    '0x65906988adee75306021c417a1a3458040239602': true, // aLBTC
    '0x5fefd7069a7d91d01f269dade14526ccf3487810': true, // aeBTC
    '0xfa82580c16a31d0c1bc632a36f82e83efef3eec0': true, // aRLUSD
    '0x4b0821e768ed9039a70ed1e80e15e76a5be5df5f': true, // aPT_eUSDE_29MAY2025
    '0xde6ef6cb4abd3a473ffc2942eef5d84536f8e864': true, // aPT_sUSDE_31JUL2025
    '0xec4ef66d4fceeba34abb4de69db391bc5476ccc8': true, // aUSDtb
    '0x312ffc57778cefa11989733e6e08143e7e229c1c': true, // aPT_USDe_31JUL2025
    '0x2edff5af94334fbd7c38ae318edf1c40e072b73b': true, // aPT_eUSDE_14AUG2025
    '0x5f9190496e0dfc831c3bd307978de4a245e2f5cd': true, // aeUSDe
    '0xcca43cef272c30415866914351fdfc3e881bb7c2': true, // aFBTC
    '0xaa6e91c82942aeae040303bf96c15a6dbcb82ca0': true, // aEURC
    '0x5f4a0873a3a02f7c0cb0e13a1d4362a1ad90e751': true, // aPT_sUSDE_25SEP2025
    '0x38a5357ce55c81add62abc84fb32981e2626adef': true, // aPT_USDe_25SEP2025
    '0x481a2acf3a72ffdc602a9541896ca1db87f86cf7': true, // atETH
    '0x4e2a4d9b3df7aae73b418bd39f3af9e148e3f479': true, // aezETH
    '0x8a2b6f94ff3a89a03e8c02ee92b55af90c9454a2': true, // aXAUt
    '0x285866acb0d60105b4ed350a463361c2d9afa0e2': true, // aPT_sUSDE_27NOV2025
    '0x38c503a438185cde29b5cf4dc1442fd6f074f1cc': true, // aPT_USDe_27NOV2025

    // vTokens
    '0xea51d7853eefb32b6ee06b1c12e6dcca88be0ffe': true, // vWETH
    '0xc96113eed8cab59cd8a66813bcb0ceb29f06d2e4': true, // vwstETH
    '0x40aabef1aa8f0eec637e0e7d92fbffb2f26a8b7b': true, // vWBTC
    '0x72e95b8931767c79ba4eee721354d6e99a61d004': true, // vUSDC
    '0xcf8d0c70c850859266f5c338b38f9d663181c314': true, // vDAI
    '0x4228f8895c7dda20227f6a5c6751b8ebf19a6ba8': true, // vLINK
    '0xbae535520abd9f8c85e58929e0006a2c8b372f74': true, // vAAVE
    '0x0c91bca95b5fe69164ce583a2ec9429a569798ed': true, // vcbETH
    '0x6df1c1e379bc5a00a7b4c6e67a203333772f45a8': true, // vUSDT
    '0xae8593dd575fe29a9745056aa91c4b746eee62c8': true, // vrETH
    '0x33652e48e4b74d18520f11bfe58edd2ed2cec5a2': true, // vLUSD
    '0x1b7d3f4b3c032a5ae656e30eea4e8e1ba376068f': true, // vCRV
    '0x6efc73e54e41b27d2134ff9f98f15550f30df9b1': true, // vMKR
    '0x8d0de040e8aad872ec3c33a3776de9152d3c34ca': true, // vSNX
    '0x3d3efceb4ff0966d34d9545d3a2fa2dcdbf451f2': true, // vBAL
    '0xf64178ebd2e2719f2b1233bcb5ef6db4bcc4d09a': true, // vUNI
    '0xc30808705c01289a3d306ca9cab081ba9114ec82': true, // vLDO
    '0xd180d7fdd4092f07428efe801e17bc03576b3192': true, // vENS
    '0xa38fca8c6bf9bda52e76eb78f08caa3be7c5a970': true, // vONE_INCH
    '0x88b8358f5bc87c2d7e116cca5b65a9eeb2c5ea3f': true, // vFRAX
    '0x786dbff3f1292ae8f92ea68cf93c30b34b1ed04b': true, // vGHO
    '0x8988eca19d502fd8b9ccd03fa3bd20a6f599bc2a': true, // vRPL
    '0x8db9d35e117d8b93c6ca9b644b25bad5d9908141': true, // vsDAI
    '0x655568bdd6168325ec7e58bf39b21a856f906dc2': true, // vSTG
    '0x253127ffc04981cea8932f406710661c2f2c3fd2': true, // vKNC
    '0x68e9f0ad4e6f8f5db70f6923d4d6d5b225b83b16': true, // vFXS
    '0x028f7886f3e937f8479efad64f31b3fe1119857a': true, // vcrvUSD
    '0x57b67e4de077085fd0af2174e9c14871be664546': true, // vPYUSD
    '0x77ad9bf13a52517ad698d65913e8d381300c8bf3': true, // vweETH
    '0x8838eeff2af391863e1bb8b1df563f86743a8470': true, // vosETH
    '0x015396e1f286289ae23a762088e863b3ec465145': true, // vUSDe
    '0x08a8dc81aea67f84745623ac6c72cda3967aab8b': true, // vETHx
    '0xeffde9bfa8ec77c14c364055a200746d6e12bed6': true, // vsUSDe
    '0xac50890a80a2731eb1ea2e9b4f29569ceb06d960': true, // vtBTC
    '0xeb284a70557efe3591b9e6d9d720040e02c54a4d': true, // vcbBTC
    '0x490e0e6255bf65b43e2e02f7acb783c5e04572ff': true, // vUSDS
    '0x6de3e52a1b7294a34e271a508082b1ff4a37e30e': true, // vrsETH
    '0x68aeb290c7727d899b47c56d1c96aeac475cd0dd': true, // vLBTC
    '0x47ed0509e64615c0d5c6d39af1b38d02bc9fe58f': true, // veBTC
    '0xbdfe7ad7976d5d7e0965ea83a81ca1bcff7e84a9': true, // vRLUSD
    '0x3c20fbfd32243dd9899301c84bce17413eee0a0c': true, // vPT_eUSDE_29MAY2025
    '0x8c6feaf5d58ba1a6541f9c4af685f62bfcbac3b1': true, // vPT_sUSDE_31JUL2025
    '0xea85a065f87fe28aa8fbf0d6c7dec472b106252c': true, // vUSDtb
    '0xd90da2df915b87fe1621a7f2201fbf4ff2cca031': true, // vPT_USDe_31JUL2025
    '0x22517fe16ded08e52e7ea3423a2ea4995b1f1731': true, // vPT_eUSDE_14AUG2025
    '0x48351fcc9536da440ae9471220f6dc921b0eb703': true, // veUSDe
    '0x4a35fd7f93324cc48bc12190d3f37493437b1eff': true, // vFBTC
    '0x6c82c66622eb360fc973d3f492f9d8e9ea538b08': true, // vEURC
    '0xc9ad8dd111e6384128146467aaf92b81ec422848': true, // vPT_sUSDE_25SEP2025
    '0x0d8486e1cabf3c9407b3dda0cfc4d9c3101fb683': true, // vPT_USDe_25SEP2025
    '0x7ec9afe70f8fd603282ebacbc9058a83623e2899': true, // vtETH
    '0x730318db7b830d324fc3feddb1d212ec64bd3141': true, // vezETH
    '0xa665bb258d2a732c170dfd505924214c0b1ac74f': true, // vXAUt
    '0x690df181701c11c53ea33bbf303c25834b66bd14': true, // vPT_sUSDE_27NOV2025
    '0x2ce7e7b238985a8ad3863de03f200b245b0c1216': true, // vPT_USDe_27NOV2025
  },
  [ChainId.arbitrum_one]: {
    '0xf97f4df75117a78c1a5a0dbb814af92458539fb4': true,

    // aTokens
    '0x23f2818e62a48e1c19921bd7eca4d278c5ce5a12': true, // aDEFAULT
    '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee': true, // aDAI
    '0xc91c5297d7e161acc74b482aafcc75b85cc0bfed': true, // aDAI_STATIC
    '0x191c10aa4af7c30e871e70c95db0e4eb77237530': true, // aLINK
    '0x27de098ef2772386cbcf1a4c8beb886368b7f9a9': true, // aLINK_STATIC
    '0x625e7708f30ca75bfd92586e17077590c60eb4cd': true, // aUSDC
    '0x0bc9e52051f553e75550ca22c196bf132c52cf0b': true, // aUSDC_STATIC
    '0x078f358208685046a11c85e8ad32895ded33a249': true, // aWBTC
    '0x32b95fbe04e5a51cf99feef4e57cf7e3fc9c5a93': true, // aWBTC_STATIC
    '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8': true, // aWETH
    '0x352f3475716261dcc991bd5f2af973eb3d0f5878': true, // aWETH_STATIC
    '0x6ab707aca953edaefbc4fd23ba73294241490620': true, // aUSDT
    '0xb165a74407fe1e519d6bcbdec1ed3202b35a4140': true, // aUSDT_STATIC
    '0xf329e36c7bf6e5e86ce2150875a84ce77f477375': true, // aAAVE
    '0x1c0c8eced17ae093b3c1a1a8ffebe2e9513a9346': true, // aAAVE_STATIC
    '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97': true, // aEURS
    '0x9a40747be51185a416b181789b671e78a8d045dd': true, // aEURS_STATIC
    '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff': true, // awstETH
    '0x7775d4ae4dbb79a624fb96aacdb8ca74f671c0df': true, // awstETH_STATIC
    '0xc45a479877e1e9dfe9fcd4056c699575a1045daa': true, // aMAI
    '0xb4a0a2692d82301703b27082cda45b083f68cace': true, // aMAI_STATIC
    '0x8eb270e296023e9d92081fdf967ddd7878724424': true, // arETH
    '0x68235105d6d33a19369d24b746cb7481fb2b34fd': true, // arETH_STATIC
    '0x8ffdf2de812095b1d19cb146e4c004587c0a0692': true, // aLUSD
    '0xdbb6314b5b07e63b7101844c0346309b79f8c20a': true, // aLUSD_STATIC
    '0x724dc807b04555b71ed48a6896b6f41593b8c637': true, // aUSDCn
    '0x7cfadfd5645b50be87d546f42699d863648251ad': true, // aUSDCn_STATIC
    '0x38d693ce1df5aadf7bc62595a37d667ad57922e5': true, // aFRAX
    '0x89aec2023f89e26dbb7eaa7a98fe3996f9d112a8': true, // aFRAX_STATIC
    '0x6533afac2e7bccb20dca161449a13a32d391fb00': true, // aARB
    '0x9b5637d7952bc9fa2d693aae51f3103760bf2693': true, // aARB_STATIC
    '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77': true, // aweETH
    '0xebe517846d0f36eced99c735cbf6131e1feb775d': true, // aGHO
    '0xd9fba68d89178e3538e708939332c79efc540179': true, // aGHO_STATIC
    '0xea1132120ddcdda2f119e99fa7a27a0d036f7ac9': true, // aezETH
    '0x6b030ff3fb9956b1b69f475b77ae0d3cf2cc5afa': true, // arsETH
    '0x62fc96b27a510cf4977b59ff952dc32378cc221d': true, // atBTC

    // vTokens
    '0x8619d80fb0141ba7f184cbf22fd724116d9f7ffc': true, // vDAI
    '0x953a573793604af8d41f306feb8274190db4ae0e': true, // vLINK
    '0xfccf3cabbe80101232d343252614b6a3ee81c989': true, // vUSDC
    '0x92b42c66840c7ad907b4bf74879ff3ef7c529473': true, // vWBTC
    '0x0c84331e39d6658cd6e6b9ba04736cc4c4734351': true, // vWETH
    '0xfb00ac187a8eb5afae4eace434f493eb62672df7': true, // vUSDT
    '0xe80761ea617f66f96274ea5e8c37f03960ecc679': true, // vAAVE
    '0x4a1c3ad6ed28a636ee1751c69071f6be75deb8b8': true, // vEURS
    '0x77ca01483f379e58174739308945f044e1a764dc': true, // vwstETH
    '0x34e2ed44ef7466d5f9e0b782b5c08b57475e7907': true, // vMAI
    '0xce186f6cccb0c955445bb9d10c59cae488fea559': true, // vrETH
    '0xa8669021776bc142dfca87c21b4a52595bcbb40a': true, // vLUSD
    '0xf611aeb5013fd2c0511c9cd55c7dc5c1140741a6': true, // vUSDCn
    '0x5d557b07776d12967914379c71a1310e917c7555': true, // vFRAX
    '0x44705f578135cc5d703b4c9c122528c73eb87145': true, // vARB
    '0x3ca5fa07689f266e907439afd1fbb59c44fe12f6': true, // vweETH
    '0x18248226c16bf76c032817854e7c83a2113b4f06': true, // vGHO
    '0x1ffd28689da7d0148ff0fcb669e9f9f0fc13a219': true, // vezETH
    '0x80ca0d8c38d2e2bcbab66aa1648bd1c7160500fe': true, // vrsETH
    '0xb5b46f918c2923fc7f26db76e8a6a6e9c4347cf9': true, // vtBTC
  },

  [ChainId.polygon]: {
    '0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c': true,

    // aTokens
    '0x17eeff31047d88bc746fd2879db24e35ecf26127': true, // aDEFAULT
    '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee': true, // aDAI
    '0x83c59636e602787a6eebbda2915217b416193fcb': true, // aDAI_STATIC
    '0x191c10aa4af7c30e871e70c95db0e4eb77237530': true, // aLINK
    '0x37868a45c6741616f9e5a189dc0481ad70056b6a': true, // aLINK_STATIC
    '0x625e7708f30ca75bfd92586e17077590c60eb4cd': true, // aUSDC
    '0x1017f4a86fc3a3c824346d0b8c5e96a5029bdaf9': true, // aUSDC_STATIC
    '0x078f358208685046a11c85e8ad32895ded33a249': true, // aWBTC
    '0xbc0f50ccb8514aa7dfeb297521c4bdebc9c7d22d': true, // aWBTC_STATIC
    '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8': true, // aWETH
    '0xb3d5af0a52a35692d3fcbe37669b3b8c31ddde7d': true, // aWETH_STATIC
    '0x6ab707aca953edaefbc4fd23ba73294241490620': true, // aUSDT0
    '0x87a1fdc4c726c459f597282be639a045062c0e46': true, // aUSDT0_STATIC
    '0xf329e36c7bf6e5e86ce2150875a84ce77f477375': true, // aAAVE
    '0xca2e1e33e5bcf4978e2d683656e1f5610f8c4a7e': true, // aAAVE_STATIC
    '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97': true, // aWPOL
    '0x98254592408e389d1dd2dba318656c2c5c305b4e': true, // aWPOL_STATIC
    '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff': true, // aCRV
    '0x4356941463ed4d75381ac23c9ef799b5d7c52ad8': true, // aCRV_STATIC
    '0xc45a479877e1e9dfe9fcd4056c699575a1045daa': true, // aSUSHI
    '0xe3ede71d32240b7ec355f0e5dd1131bbe029f934': true, // aSUSHI_STATIC
    '0x8eb270e296023e9d92081fdf967ddd7878724424': true, // aGHST
    '0x123319636a6a9c85d9959399304f4cb23f64327e': true, // aGHST_STATIC
    '0x8ffdf2de812095b1d19cb146e4c004587c0a0692': true, // aBAL
    '0x1a8969fd39abaf228e690b172c4c3eb7c67f95e1': true, // aBAL_STATIC
    '0x724dc807b04555b71ed48a6896b6f41593b8c637': true, // aDPI
    '0x73b788aca5f4f0eeb3c6da453cdf31041a77b36d': true, // aDPI_STATIC
    '0x38d693ce1df5aadf7bc62595a37d667ad57922e5': true, // aEURS
    '0x02e26888ed3240bb38f26a2adf96af9b52b167ea': true, // aEURS_STATIC
    '0x6533afac2e7bccb20dca161449a13a32d391fb00': true, // ajEUR
    '0xd992dac78ef3f34614e6a7d325b7b6a320fc0ab5': true, // ajEUR_STATIC
    '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77': true, // aEURA
    '0xd3eb8796ed36f58e03b7b4b5ad417fa74931d2c4': true, // aEURA_STATIC
    '0xebe517846d0f36eced99c735cbf6131e1feb775d': true, // amiMATIC
    '0x8486b49433cced038b51d18ae3772cdb7e31ca5e': true, // amiMATIC_STATIC
    '0xea1132120ddcdda2f119e99fa7a27a0d036f7ac9': true, // astMATIC
    '0x867a180b7060fdc27610dc9096e93534f638a315': true, // astMATIC_STATIC
    '0x80ca0d8c38d2e2bcbab66aa1648bd1c7160500fe': true, // aMaticX
    '0xbcdd5709641af4be99b1470a2b3a5203539132ec': true, // aMaticX_STATIC
    '0xf59036caebea7dc4b86638dfa2e3c97da9fccd40': true, // awstETH
    '0x5274453f4cd5dd7280011a1cca3b9e1b78ec59a6': true, // awstETH_STATIC
    '0xa4d94019934d8333ef880abffbf2fdd611c762bd': true, // aUSDCn
    '0x2dca80061632f3f87c9ca28364d1d0c30cd79a19': true, // aUSDCn_STATIC

    // vTokens
    '0x8619d80fb0141ba7f184cbf22fd724116d9f7ffc': true, // vDAI
    '0x953a573793604af8d41f306feb8274190db4ae0e': true, // vLINK
    '0xfccf3cabbe80101232d343252614b6a3ee81c989': true, // vUSDC
    '0x92b42c66840c7ad907b4bf74879ff3ef7c529473': true, // vWBTC
    '0x0c84331e39d6658cd6e6b9ba04736cc4c4734351': true, // vWETH
    '0xfb00ac187a8eb5afae4eace434f493eb62672df7': true, // vUSDT0
    '0xe80761ea617f66f96274ea5e8c37f03960ecc679': true, // vAAVE
    '0x4a1c3ad6ed28a636ee1751c69071f6be75deb8b8': true, // vWPOL
    '0x77ca01483f379e58174739308945f044e1a764dc': true, // vCRV
    '0x34e2ed44ef7466d5f9e0b782b5c08b57475e7907': true, // vSUSHI
    '0xce186f6cccb0c955445bb9d10c59cae488fea559': true, // vGHST
    '0xa8669021776bc142dfca87c21b4a52595bcbb40a': true, // vBAL
    '0xf611aeb5013fd2c0511c9cd55c7dc5c1140741a6': true, // vDPI
    '0x5d557b07776d12967914379c71a1310e917c7555': true, // vEURS
    '0x44705f578135cc5d703b4c9c122528c73eb87145': true, // vjEUR
    '0x3ca5fa07689f266e907439afd1fbb59c44fe12f6': true, // vEURA
    '0x18248226c16bf76c032817854e7c83a2113b4f06': true, // vmiMATIC
    '0x6b030ff3fb9956b1b69f475b77ae0d3cf2cc5afa': true, // vstMATIC
    '0xb5b46f918c2923fc7f26db76e8a6a6e9c4347cf9': true, // vMaticX
    '0x77fa66882a8854d883101fb8501bd3cad347fc32': true, // vwstETH
    '0xe701126012ec0290822eea17b794454d1af8b030': true, // vUSDCn
  },
  [ChainId.avalanche]: {
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': true,

    // aTokens
    '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE': true, // aDAIe
    '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530': true, // aLINKe
    '0x625E7708f30cA75bfd92586e17077590C60eb4cD': true, // aUSDC
    '0x078f358208685046a11C85e8ad32895DED33A249': true, // aWBTCe
    '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8': true, // aWETHe
    '0x6ab707Aca953eDAeFBc4fD23bA73294241490620': true, // aUSDt
    '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375': true, // aAAVEe
    '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97': true, // aWAVAX
    '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf': true, // asAVAX
    '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA': true, // aFRAX
    '0x8Eb270e296023E9D92081fdF967dDd7878724424': true, // aMAI
    '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692': true, // aBTCb
    '0x724dc807b04555b71ed48a6896b6F41593b8C637': true, // aAUSD
    '0xf611aEb5013fD2c0511c9CD55c7dc5C1140741A6': true, // aGHO
    '0x8a9FdE6925a839F6B1932d16B36aC026F8d3FbdB': true, // aEURC

    // vTokens
    '0x8619d80FB0141ba7F184CbF22fd724116D9f7ffC': true, // vDAIe
    '0x953A573793604aF8d41F306FEb8274190dB4aE0e': true, // vLINKe
    '0xFCCf3cAbbe80101232d343252614b6A3eE81C989': true, // vUSDC
    '0x92b42c66840C7AD907b4BF74879FF3eF7c529473': true, // vWBTCe
    '0x0c84331e39d6658Cd6e6b9ba04736cC4c4734351': true, // vWETHe
    '0xfb00AC187a8Eb5AFAE4eACE434F493Eb62672df7': true, // vUSDt
    '0xE80761Ea617F66F96274eA5e8c37f03960ecC679': true, // vAAVEe
    '0x4a1c3aD6Ed28a636ee1751C69071f6be75DEb8B8': true, // vWAVAX
    '0x77CA01483f379E58174739308945f044e1a764dc': true, // vsAVAX
    '0x34e2eD44EF7466D5f9E0b782B5c08b57475e7907': true, // vFRAX
    '0xCE186F6Cccb0c955445bb9d10C59caE488Fea559': true, // vMAI
    '0xA8669021776Bc142DfcA87c21b4A52595bCbB40a': true, // vBTCb
    '0xf611aEb5013fD2c0511c9CD55c7dc5C1140741A7': true, // vAUSD
    '0x5D557B07776D12967914379C71a1310e917C7556': true, // vGHO
    '0x44705f578135cC5d703b4c9c122528C73Eb87146': true, // vEURC
  },
  [ChainId.optimism]: {
    '0x76fb31fb4af56892a25e32cfc43de717950c9278': false, // aave

    // aTokens
    '0x910124b269d81f416d3f6a8767abd575336b4675': true, // aDEFAULT
    '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee': true, // aDAI
    '0x6ddc64289be8a71a707fb057d5d07cc756055d6e': true, // aDAI_STATIC
    '0x191c10aa4af7c30e871e70c95db0e4eb77237530': true, // aLINK
    '0x39bcf217acc4bf2fcaf7bc8800e69d986912c75e': true, // aLINK_STATIC
    '0x625e7708f30ca75bfd92586e17077590c60eb4cd': true, // aUSDC
    '0x9f281eb58fd98ad98ede0fc4c553ad4d73e7ca2c': true, // aUSDC_STATIC
    '0x078f358208685046a11c85e8ad32895ded33a249': true, // aWBTC
    '0x6d998feefc7b3664ead09caf02b5a0fc2e365f18': true, // aWBTC_STATIC
    '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8': true, // aWETH
    '0x98d69620c31869fd4822ceb6adab31180475fd37': true, // aWETH_STATIC
    '0x6ab707aca953edaefbc4fd23ba73294241490620': true, // aUSDT
    '0x035c93db04e5aaea54e6cd0261c492a3e0638b37': true, // aUSDT_STATIC
    '0xf329e36c7bf6e5e86ce2150875a84ce77f477375': true, // aAAVE
    '0xae0ca1b1bc6cac26981b5e2b9c40f8ce8a9082ee': true, // aAAVE_STATIC
    '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97': true, // asUSD
    '0x3a956e2fcc7e71ea14b0257d40bebdb287d19652': true, // asUSD_STATIC
    '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff': true, // aOP
    '0xd4f1cf9a038269fe8f03745c2875591ad6438ab1': true, // aOP_STATIC
    '0xc45a479877e1e9dfe9fcd4056c699575a1045daa': true, // awstETH
    '0xb972abef80046a57409e37a7df5def2638917516': true, // awstETH_STATIC
    '0x8eb270e296023e9d92081fdf967ddd7878724424': true, // aLUSD
    '0x84648dc3cefb601bc28a49a07a1a8bad04d30ad3': true, // aLUSD_STATIC
    '0x8ffdf2de812095b1d19cb146e4c004587c0a0692': true, // aMAI
    '0x60495bc8d8baf7e866888ecc00491e37b47dff24': true, // aMAI_STATIC
    '0x724dc807b04555b71ed48a6896b6f41593b8c637': true, // arETH
    '0xf9ce3c97b4b54f3d16861420f4816d9f68190b7b': true, // arETH_STATIC
    '0x38d693ce1df5aadf7bc62595a37d667ad57922e5': true, // aUSDCn
    '0x4dd03dfd36548c840b563745e3fbec320f37ba7e': true, // aUSDCn_STATIC

    // vTokens
    '0x8619d80fb0141ba7f184cbf22fd724116d9f7ffc': true, // vDAI
    '0x953a573793604af8d41f306feb8274190db4ae0e': true, // vLINK
    '0xfccf3cabbe80101232d343252614b6a3ee81c989': true, // vUSDC
    '0x92b42c66840c7ad907b4bf74879ff3ef7c529473': true, // vWBTC
    '0x0c84331e39d6658cd6e6b9ba04736cc4c4734351': true, // vWETH
    '0xfb00ac187a8eb5afae4eace434f493eb62672df7': true, // vUSDT
    '0xe80761ea617f66f96274ea5e8c37f03960ecc679': true, // vAAVE
    '0x4a1c3ad6ed28a636ee1751c69071f6be75deb8b8': true, // vsUSD
    '0x77ca01483f379e58174739308945f044e1a764dc': true, // vOP
    '0x34e2ed44ef7466d5f9e0b782b5c08b57475e7907': true, // vwstETH
    '0xce186f6cccb0c955445bb9d10c59cae488fea559': true, // vLUSD
    '0xa8669021776bc142dfca87c21b4a52595bcbb40a': true, // vMAI
    '0xf611aeb5013fd2c0511c9cd55c7dc5c1140741a6': true, // vrETH
    '0x5d557b07776d12967914379c71a1310e917c7555': true, // vUSDCn
  },
  [ChainId.zksync]: {
    '0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e': true,
    '0x703b52f2b28febcb60e1372858af5b18849fe867': true,
    '0x493257fd37edb34451f62edf8d2a0c418852ba4c': true,
    '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91': true,

    // aTokens
    '0x1c6e9cd0d41da47d90d9118560c04468a1b2dee2': true, // aDEFAULT
    '0xe977f9b2a5ccf0457870a67231f23be4daecfbdb': true, // aUSDC
    '0xc48574bc5358c967d9447e7df70230fdb469e4e7': true, // aUSDT
    '0xb7b93bcf82519bb757fd18b23a389245dbd8ca64': true, // aWETH
    '0xd4e607633f3d984633e946aea4eb71f92564c1c9': true, // awstETH
    '0xd6cd2c0fc55936498726cacc497832052a9b2d1b': true, // aZK
    '0xe818a67ee5c0531afaa31aa6e20bcac36227a641': true, // aweETH
    '0xf3c9d58b76ac6ee6811520021e9a9318c49e4cfa': true, // asUSDe
    '0x5722921bb6c37eaeb78b993765aa5d79cc50052f': true, // awrsETH

    // vTokens
    '0x0049250d15a8550c5a14baa5af5b662a93a525b9': true, // vUSDC
    '0x8992db58077fe8c7b80c1b3a738eae8a7bddba34': true, // vUSDT
    '0x98dc737ea0e9bcb254c3f98510a71c5e11f74238': true, // vWETH
    '0x6ad279f6523f6421fd5b0324a97d8f62eecd80c8': true, // vwstETH
    '0x6450fd7f877b5bb726f7bc6bf0e6ffabd48d72ad': true, // vZK
    '0xf31e1599b4480d07fa96a7248c4f05ca84da7fa8': true, // vweETH
    '0xdebb4ddaaab1676775214552a7a05d6a13f905da': true, // vsUSDe
    '0x97dec07366be72884331be21704fd93bf35286f9': true, // vwrsETH
  },
  [ChainId.linea]: {
    '0xa219439258ca9da29e9cc4ce5596924745e12b93': true, // USDT
    '0x2416092f143378750bb29b79ed961ab195cceea5': true, // ezETH
    '0xb5bedd42000b71fdde22d3ee8a79bd49a568fc8f': true, // wstETH

    // aTokens
    '0x45338b98572c67c28425bba5af6120719aae8492': true, // aDEFAULT
    '0x787897df92703bb3fc4d9ee98e15c0b8130bf163': true, // aWETH
    '0x37f7e06359f98162615e016d0008023d910bb576': true, // aWBTC
    '0x374d7860c4f2f604de0191298dd393703cce84f3': true, // aUSDC
    '0x88231dfec71d4ff5c1e466d08c321944a7adc673': true, // aUSDT
    '0x58943d20e010d9e34c4511990e232783460d0219': true, // awstETH
    '0x935efcbefc1df0541afc3fe145134f8c9a0beb89': true, // aezETH
    '0x0c7921ab4888fd06731898b3ffffeb06781d5f4f': true, // aweETH
    '0xcdd80e6211fc767352b198f827200c7e93d7bb04': true, // awrsETH

    // vTokens
    '0x0e7543a9da61b2e71fc880685ed2945b7426a689': true, // vWETH
    '0x74a1b56f5137b00aa0ada1dd964a3a361ecc32e9': true, // vWBTC
    '0x63ab166e6e1b6fb705b6ca23686fad9705eb3534': true, // vUSDC
    '0x4cedfa47f7d0e9036110b850ce49f4cd47b28a2f': true, // vUSDT
    '0x81c1a619be23050b3242b41a739e6b6cfda56687': true, // vwstETH
    '0x1fe3452cef885724f8adf1382ee17d05d7e01cab': true, // vezETH
    '0x37a843725508243952950307ceace7a9f5d5c280': true, // vweETH
    '0xf3c806a402e4e9101373f76c05880eeac91bb5b9': true, // vwrsETH
  },
  [ChainId.sonic]: {
    // adding these in false for clarity
    '0x50c42deacd8fc9773493ed674b675be577f2634b': false, // WETH
    '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38': false, // wS
    '0x29219dd400f2bf60e5a23d13be72b486d4038894': false, // USDC.e

    // aTokens
    '0xe18Ab82c81E7Eecff32B8A82B1b7d2d23F1EcE96': true, // aWETH
    '0x578Ee1ca3a8E1b54554Da1Bf7C583506C4CD11c6': true, // aUSDC
    '0x6C5E14A212c1C3e4Baf6f871ac9B1a969918c131': true, // awS
    '0xeAa74D7F42267eB907092AF4Bc700f667EeD0B8B': true, // astS

    // vTokens
    '0x8619d80FB0141ba7F184CbF22fd724116D9f7ffC': true, // vWETH
    '0x953A573793604aF8d41F306FEb8274190dB4aE0e': true, // vUSDC
    '0xFCCf3cAbbe80101232d343252614b6A3eE81C989': true, // vwS
    '0x92b42c66840C7AD907b4BF74879FF3eF7c529473': true, // vstS
  },
  [ChainId.celo]: {
    // '0xceba9300f2b948710d2653dd7b07f33a8b32118c': true, // USDC
    '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e': true, // USDT
    // '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73': true, // cEUR
    // '0x765de816845861e75a25fca122bb6898b8b1282a': true, // cUSD

    // aTokens
    '0x0b89e33cde70fa6fd2cd1c243790b9e19a914927': true, // aDEFAULT
    '0xff8309b9e99bfd2d4021bc71a362abd93dbd4785': true, // aUSDC
    '0xdee98402a302e4d707fb9bf2bac66faeec31e8df': true, // aUSDT
    '0x34c02571094e08e935b8cf8dc10f1ad6795f1f81': true, // acEUR
    '0xbba98352628b0b0c4b40583f593ffcb630935a45': true, // acUSD
    '0xc3e77dc389537db1eec7c33b95cf3beeca71a209': true, // aCELO
    '0xf385280f36e009c157697d25e0b802efabfd789c': true, // aWETH

    // vTokens
    '0xdbe517c0fa6467873b684eccbed77217e471e862': true, // vUSDC
    '0xe15324a9887999803b931ac45aa89a94a9750052': true, // vUSDT
    '0x5c2b7eb5886b3cec5cce1019e34493da33291af5': true, // vcEUR
    '0x05ee3d1fbacbdba1259946033cd7a42fdfcccf0d': true, // vcUSD
    '0xaea37b42955de2ba2e4af6581e46349bcd3ea2d6': true, // vCELO
    '0x6508cff7c5fba053af00a4e894500e6fa00274b7': true, // vWETH
  },
  [ChainId.xdai]: {
    // aTokens
    '0xe04bfe47101bbe9aa35f09210589517f04136d23': true, // aDEFAULT
    '0xa818f1b57c201e092c4a2017a91815034326efd1': true, // aWETH
    '0xd843fb478c5aa9759fea3f3c98d467e2f136190a': true, // aWETH_STATIC
    '0x23e4e76d01b2002be436ce8d6044b0aa2f68b68a': true, // awstETH
    '0xecfd0638175e291ba3f784a58fb9d38a25418904': true, // awstETH_STATIC
    '0xa1fa064a85266e2ca82dee5c5ccec84df445760e': true, // aGNO
    '0x2d737e2b0e175f05d0904c208d6c4e40da570f65': true, // aGNO_STATIC
    '0xc6b7aca6de8a6044e0e32d0c841a89244a10d284': true, // aUSDC
    '0x270ba1f35d8b87510d24f693fccc0da02e6e4eeb': true, // aUSDC_STATIC
    '0xd0dd6cef72143e22cced4867eb0d5f2328715533': true, // aWXDAI
    '0x7f0eae87df30c468e0680c83549d0b3de7664d4b': true, // aWXDAI_STATIC
    '0xedbc7449a9b594ca4e053d9737ec5dc4cbccbfb2': true, // aEURe
    '0x8418d17640a74f1614ac3e1826f29e78714488a1': true, // aEURe_STATIC
    '0x7a5c3860a77a8dc1b225bd46d0fb2ac1c6d191bc': true, // asDAI
    '0xf3f45960f8de00d8ed614d445a5a268c6f6dec4f': true, // asDAI_STATIC
    '0xc0333cb85b59a788d8c7cae5e1fd6e229a3e5a65': true, // aUSDCe
    '0xf0e7ec247b918311afa054e0aedb99d74c31b809': true, // aUSDCe_STATIC
    '0x3fdcec11b4f15c79d483aedc56f37d302837cf4d': true, // aGHO

    // vTokens
    '0x0c0fce05f2314540ecb095bf4d069e5e0ed90ff8': true, // vWETH
    '0x9d881f67f20b49243c98f53d2b9e91e39d02ae09': true, // vwstETH
    '0xbc59e99198dba71985a66e1713cc89ffec53f7fc': true, // vGNO
    '0x5f6f7b0a87ca3cf3d0b431ae03ef3305180bff4d': true, // vUSDC
    '0x281963d7471ecdc3a2bd4503e24e89691cfe420d': true, // vWXDAI
    '0xb96404e475f337a7e98e4a541c9b71309bb66c5a': true, // vEURe
    '0x8fe06e1d8aff42bf6812cacf7854a2249a00bed7': true, // vsDAI
    '0x37b9ad6b5dc8ad977ad716e92f49e9d200e58431': true, // vUSDCe
    '0x2766eefe0311bf7421cc30155b03d210bce30df8': true, // vGHO
  },
};

export const rwaAssetDomains: { [key: string]: { name: string; version: string } } = {
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
};
