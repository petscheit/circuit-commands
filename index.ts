// import "@t3rn/types/api-augment"

import { ApiPromise, WsProvider } from '@polkadot/api';
import { register, setOperational, registerParachain, getStorageKey } from "./register";
import types from "./types.json"
import { submitTransfer } from "./submit";
import { SubstrateListener } from './listener';


class TransferSiseEffect {
    listener: SubstrateListener
    rococo: ApiPromise;
    circuit: ApiPromise;
    rococoId: number[];
    transactionTarget: number[];
    moonId: number[];

    async setup() {
        this.rococoId = [97, 98, 99, 100]
        this.transactionTarget = [97, 98, 99, 100];
        this.moonId = [109, 111, 111, 110];
        // .map(() => Math.floor(97 + Math.random() * 26));
        // this.listener = new SubstrateListener(this.circuit, this.rococo, this.target)

        this.rococo = await ApiPromise.create({ 
            provider: new WsProvider("wss://rococo-rpc.polkadot.io"),
        })
        this.circuit = await ApiPromise.create({
            provider: new WsProvider("ws://127.0.0.1:9944"),
            types: types as any
        })
    }

    async close() {
        this.rococo.disconnect();
        this.circuit.disconnect();
    }

    async run() {
        await this.setup();
        console.log("Initialized API")
        const args = process.argv[2]
        switch(args) {
            case "register_relay": {
                await this.registerRelaychain()
                break;
            }
            case "register_parachain": {
                await this.registerParachain()
                break;
            }
            case "submit_transfer": {
                await submitTransfer(this.circuit, this.transactionTarget);
                break;
            }
            case "submit_para_header": {
                await getStorageKey(this.rococo);
                break;
            }
        }
        // this.close()
    }

    async registerRelaychain() {
        await register(this.circuit, this.rococoId)
        await this.delay()
        console.log("Registered Roccoco")
        await setOperational(this.circuit, this.rococoId)
        console.log("Set operational")
    }

    async registerParachain() {
        await registerParachain(this.circuit, this.moonId)
        await this.delay()
        console.log("Registered Moonbeam")
    }
    
    async delay() {
        return new Promise<void>((res, rej) => {
            setTimeout(() => {
                res()
            }, 6000)
        })
    }

}


(async () => {
    let trans = new TransferSiseEffect();
    trans.run()
})()

