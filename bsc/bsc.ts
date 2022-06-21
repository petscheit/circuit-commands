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
        "https://data-seed-prebsc-1-s1.binance.org:8545/",
        "bina",
        null,
        createGatewayABIConfig(circuit, 32, 20, 32, 18, 'Ecdsa', 'Keccak256'),
        //GatewayVendor: 'Substrate' as moon is substrate-based
        circuit.createType('GatewayVendor', 'BinanceSmartChain'),
        //GatewayType: we connect as a ProgrammableExternal
        circuit.createType('GatewayType', { ProgrammableExternal: 1 }),
        circuit.createType('GatewayGenesisConfig', [circuit.createType('Option<Bytes>', null), 0, []]),
        createGatewaySysProps(circuit, 60, '', 0), // GatewaySysProps
        //Initial moon, acts as gateway activation point
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
    const amount = new BN(10000000000)
    console.log("Amount:", amount.toString());
    console.log("Amount arr:", amount.toArray("le", 16))
    return circuit.tx.circuit
        .onExtrinsicTrigger(
            [
                {
                    target: [98, 105, 110, 97], //bina
                    prize: 0,
                    ordered_at: 0,
                    encoded_action: [101, 116, 114, 97], //etra
                    encoded_args: ["0xcD4D1532CeE0FddeD0b5B104Ba5f3ae2b675BDE4", "0x8C84862304949CbC99fBCdf208906cB6d62B3603", "0xFC73710B16840D4a1Dd7b7676134607ac33E22b6", amount.toArray("le", 16)],
                    signature: null,
                    enforce_executioner: null,
                }
            ],
            0, // fee must be set to 0
            false
        ).signAndSend(keyring.alice)
        .catch(err => console.error(err));
}

// (async () => {
//     [ bscInstance, circuit ] = await getInstances()
//     registerBSC()
// })()

(async () => {
    [bscInstance, circuit] = await getInstances()
    submitTransfer()
})()


// coffee horror abuse jeans novel paddle tiny clinic disagree never response squirrel
