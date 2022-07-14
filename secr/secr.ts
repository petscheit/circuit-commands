import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { createGatewayABIConfig, createGatewaySysProps } from '../utils/utils';
import { getInstances } from './client';
import { scaleEncodeHeader } from './encode';
import { createTestPairs } from "@polkadot/keyring/testingPairs";
const BN = require('bn.js');
let bscInstance;
let circuit; 

const getLatestEpochBlock = async () => {
    const currentBlock = await bscInstance.eth.getBlockNumber();
    const latestEpoch = currentBlock - (currentBlock % 200)
    let rpcBlock = await bscInstance.eth.getBlock(latestEpoch)
    console.log(latestEpoch)
    return scaleEncodeHeader(rpcBlock)

}

export const registerBSC = async () => {
    const registerGateway = circuit.tx.circuitPortal.registerGateway(
        "wss://bsc-ws-node.nariox.org:443",
        "secr",
        null,
        createGatewayABIConfig(circuit, 32, 20, 32, 18, 'Ecdsa', 'Keccak256'),
        //GatewayVendor: 'Substrate' as moon is substrate-based
        circuit.createType('GatewayVendor', 'BinanceSmartChain'),
        //GatewayType: we connect as a ProgrammableExternal
        circuit.createType('GatewayType', { ProgrammableExternal: 1 }),
        circuit.createType('GatewayGenesisConfig', [circuit.createType('Option<Bytes>', null), 0, []]),
        createGatewaySysProps(circuit, 60, '', 0), // GatewaySysProps
        //Initial moon, acts as gateway activation point
        // circuit.createType('Bytes', "0x6100000000000000fb16fcad19794add527a38a74b2163842dbcaf4299f0bcb0f81fba597c278f151dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347e9ae3261a475a27bb1028f140bc2a7c843318afde3306b6f8107792df9770a00f670765e5ca652b09f1647fc5acc88be81acae304d160592d9508e6219d67211fb33004943f48d943ddfd96622b35d82780fed48fdf7d07edda96479b3c342e9f0fcbe90f3b0915a54b76a0a0d5ae0eee1e97952b233e2f7b8b1171cd70e3189d1f2fec2032240dfbd05279e599c41327f24112866511d5163f6018dc2472ebe4c4a216e4abbd2790516a9455fd51011ca6e4f98d9c33462cdf1d81643b2466d1ab14f68a4dd1a3dcbde080e539d8500e416fdbcd2000fa80eba834b235765211886991a08b3af09d0efa40fd80988f6400ac645d5c39e87b6d9e43cec897649392314983ffcdd9925b7cd88e455515f06dd03268f1a514d5c0a6b3a6952611d273e4518d1a60eed5d6aa5a9a80b65f1c166e23ded000f97cd0b854690969dae7ec234daf1e3a5b1f958d0332883ca238c1df8212c1975bd818444fd190c949ac4301743d2ca420b4bd124f9ba9a581a22faec540200000000000000401c2001000000006ae4600500000000000000000000000000000000000000000000000000000000abb7670100000000000000000000000000000000000000000000000000000000e4b5b16200000000d98301010b846765746889676f312e31362e3135856c696e757800005d43d2fd012465176c461afb316ebc773c61faee85a6515daa295e26495cef6f69dfa69911d9d8e4f3bbadb89b2b3a6c089311b478bf629c29d790a7a6db3fc1b92d4c407bbe49438ed859fe965b140dcf1aab71a93f349bbafec1551819b8be1efea2fc46ca749aa1685b1ded8013785d6623cc18d214320b6bb6475970f657164e5b75689b64b7fd1fa275f334f28e1872b61c6014342d914470ec7ac2975be345796c2b7ae2f5b9e386cd1b50a4550696d957cb4900f03a8b6c8fd93d6f4cea42bbb345dbc6f0dfdb5bec739f8ccdafcc39f3c7d6ebf637c9151673cbc36b88a6f79b60359f141df90a0c745125b131caaffd12aacf6a8119f7e11623b5a43da638e91f669a130fac0e15a038eedfc68ba3c35c73fed5be4a07afb5be807dddb074639cd9fa61b47676c064fc50d62cce2fd7544e0b2cc94692d4a704debef7bcb61328e2d3a739effcd3a99387d015e260eefac72ebea1e9ae3261a475a27bb1028f140bc2a7c843318afdea0a6e3c511bbd10f4519ece37dc24887e11b55dee226379db83cffc681495730c11fdde79ba4c0cef0274e31810c9df02f98fafde0f841f4e66a1cd29600024f084ed903c691f793d346fb3116d2851c9bf358bdd4a27edfed9d8097dd056fb256e0f8c789b8586380f5f08eebeb6079eaef6e3fff49a574725ab400000000000000000000000000000000000000000000000000000000000000000000000000000000000"),
        circuit.createType('Bytes', await getLatestEpochBlock()),
        circuit.createType('Option<Vec<AccountId>>', null),
        circuit.createType('Option<SetId>', null),
        //SideEffects that are allowed on gateway instance
        circuit.createType('Vec<AllowedSideEffect>', ['etra']) // allowed side effects
    );

    const keyring = new Keyring({ type: 'sr25519', ss58Format: 60 });
    const alice = keyring.addFromUri('//Alice');
    return circuit.tx.sudo.sudo(registerGateway).signAndSend(alice);
}

export const submitTransfer = async () => {
    const keyring = createTestPairs({ type: 'sr25519' });
    Math.random() * 1000000000000
    const amount = new BN(Math.random() * 1000000000000)
    console.log("Amount:", amount.toString());
    console.log("Amount arr:", amount.toArray("le", 32))
    return circuit.tx.circuit
        .onExtrinsicTrigger(
            [
                {
                    target: [115, 101, 99, 114], //secr
                    prize: 0,
                    ordered_at: 0,
                    encoded_action: [101, 116, 114, 97], //etra
                    encoded_args: ["0xcD4D1532CeE0FddeD0b5B104Ba5f3ae2b675BDE4", "0x8C84862304949CbC99fBCdf208906cB6d62B3603", "0xFC73710B16840D4a1Dd7b7676134607ac33E22b6", amount.toArray("le", 32)],
                    signature: null,
                    enforce_executioner: null,
                }
            ],
            0, // fee must be set to 0
            false
        ).signAndSend(keyring.alice)
        .catch(err => console.error(err));
}

(async () => {
    [ bscInstance, circuit ] = await getInstances()
    registerBSC()
})()

// (async () => {
//     [bscInstance, circuit] = await getInstances()
//     submitTransfer()
// })()


// coffee horror abuse jeans novel paddle tiny clinic disagree never response squirrel
