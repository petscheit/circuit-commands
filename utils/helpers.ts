import { ApiPromise } from '@polkadot/api';
// import { u8aToHex, stringToU8a } from '@polkadot/util';
// import { xxhashAsU8a, xxhashAsHex } from '@polkadot/util-crypto';

import { u8aConcat, u8aToU8a, u8aToHex } from '@polkadot/util';
import { xxhashAsU8a } from '@polkadot/util-crypto';
const BN = require("bn.js");

async function getStorage(api: ApiPromise, parameters: any) {
    let res = await api.rpc.state.getStorage(parameters.key);
    return {
        // @ts-ignore
        // { value: '0x1c86d8cbffffffffffffffffffffffff', status: true }
        // We may have to change it later down the line.
        value: res.toHex(),
        status: res !== undefined ? true : false,
    }
}

function encodeParachainId(id: number) {
    // this is the correct encoding for u32
    return "0x" + new BN(id).toBuffer("le", 4).toString("hex")
}

function generateKeyForStorageValue(module: string, variableName: string, parachainid: number) {
    // lets prepare the storage key for system events.
    let module_hash = xxhashAsU8a(module, 128);
    let storage_value_hash = xxhashAsU8a(variableName, 128);

    let encodedParachainId = encodeParachainId(parachainid)
    let argumenteKey = u8aConcat(xxhashAsU8a(encodedParachainId, 64), u8aToU8a(encodedParachainId))

    // Special syntax to concatenate Uint8Array
    let final_key = new Uint8Array([...module_hash, ...storage_value_hash, ...argumenteKey]);

    return u8aToHex(final_key);
}

export const getHeaderProof = async (api: ApiPromise, blockHash: any, parachainId: number) => {
    let key = generateKeyForStorageValue('Paras', 'Heads', parachainId); // these are correct!
    const proof = await api.rpc.state.getReadProof([key], blockHash);
    console.log("proof:", proof.toHuman())
    return proof;
}