import { types } from "./types";
const { ApiPromise } = require('@polkadot/api');

export const scaleEncodeHeader = async (rpcBlock: any,) => {
    const api = await ApiPromise.create({ types });
    let poaBlock = rpcBlock;
    poaBlock['chainId'] = 56;
    delete poaBlock.hash;
    delete poaBlock.size;

    poaBlock = formatExtraData(poaBlock);

    let header = api.createType('BscHeader', poaBlock)
    console.log("SCALE HEADER:", header.toHuman())
    return header.toHex()
}

const formatExtraData = (header: any) => {
    const extraData = header.extraData.toLowerCase().split("0x")[1]
    header.extra = "0x" + extraData.slice(0, 64);
    if (header.number % 200 === 0) {
        header.validators = "0x" + extraData.slice(64, 904); // 20 byte * 21 + 64
        header.signature = "0x" + extraData.slice(904, 1034)
    } else {
        header.validators = null;
        header.signature = "0x" + extraData.slice(64, 194)
    }
    return header
}