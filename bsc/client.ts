const Web3 = require('web3');
import { ApiPromise, WsProvider } from '@polkadot/api';
import types from '../types.json';


export const getInstances = async () => {
    const bscInstance = new Web3('https://bscrpc.com');
    
    const provider = new WsProvider("ws://localhost:9944");
    const circuit = await ApiPromise.create({ provider, types: types as any });
    return [ bscInstance, circuit ]

}