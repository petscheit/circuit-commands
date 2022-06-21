export const types = {
    BscHeader: {
        chainId: "u64",
        parentHash: "H256",
        sha3Uncles: "H256",
        miner: "H160",
        stateRoot: "H256",
        transactionsRoot: "H256",
        receiptsRoot: "H256",
        logsBloom: "LogsBloom",
        difficulty: "u64",
        number: "u64",
        gasLimit: "U256",
        gasUsed: "U256",
        timestamp: "u64",
        extra: "[u8; 32]",
        validators: "Option<[H160; 21]>",
        signature: "[u8; 65]",
        mixHash: "H256",
        nonce: "u64",
    },
    LogsBloom: "([u8; 256])",
    Topics: "(Vec<H256>)",
    Receipt: {
        status: "bool",
        cumulativeGasUsed: "U256",
        logsBloom: "LogsBloom",
        logs: "Vec<Event>"
    },
    Event: {
        address: "H160",
        topics: "Topics",
        data: "Vec<u8>"
    },
    Proof: {
        bytes: "Vec<Vec<u8>>",
        index: "Vec<u8>"
    },
};
