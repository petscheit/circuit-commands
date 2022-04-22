import { ApiPromise, WsProvider } from '@polkadot/api';
import { JustificationNotification } from '@polkadot/types/interfaces/';
import { submitProof, submitHeaderProof } from "./relayer"
import { getHeaderProof } from "./utils/helpers";
const { exec } = require('child_process');
require('dotenv').config();

export class SubstrateListener {
    rangeSize: number;
    gatewayId: any[];
    headers: any[] = [];
    headerListener: any;
    anchorJustification: JustificationNotification;
    circuit: ApiPromise;
    rococo: ApiPromise;

    constructor(circuit: ApiPromise, rococo: ApiPromise, gatewayId: any[]) {
        this.rangeSize = 5;
        this.gatewayId = gatewayId;
        this.circuit = circuit;
        this.rococo = rococo;
    }

    async initListener() {
        let listener = await ApiPromise.create({
            provider: new WsProvider("wss://rococo-rpc.polkadot.io"),
        })
        this.headerListener = await listener.rpc.chain.subscribeNewHeads(async (header) => {
            console.log("Header:", header.number.toNumber());
            this.headers.push(header)

            if (this.headers.length === this.rangeSize) {
                console.log("range size reached! continuing listen until matchig justification is found")
                this.fetchIncomingGrandpaJustification(listener);
            }
        });
    }

    // async test(gatewayId: any[]) {
    //     let listener = await ApiPromise.create({
    //         provider: new WsProvider("wss://rococo-rpc.polkadot.io"),
    //     })
    //     const justification = "0xbe01000000000000a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f586030074a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300459b987f6afc907cec88e82eaf747e642ff490e07871ee1d622d0560a1dafb0a34e3e2d69c79312e157256ee20667515aa99cf14d8347500c826826f5c51ee0004b478a5991920e5b2ac9d191e0bbd11e5fc0448fd3a5c95d5d7ee92d91d005ba60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300062e8fff1399f990abc1b73ee364084aeb60b3c7ff4c10091f7f3bbd009c26ee46de1dcbf262e57062716e9c76d9dd1a6f54bdda95ada0aa686a24bb5faac108060c33e470de21d74c140907790c6c664fa7ffb149faedf9bd60a41fc7822223a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300a267b8b543cdfe11bfa4ffabc6bd00186a527136fc271aba26b54e44b66dc4398ee81e4424525897acc2acd67685acdc2e237eb4fa9665bb92e754c3fcdcec0d0e6d7d1afbcc6547b92995a394ba0daed07a2420be08220a5a1336c6731f0bfaa60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f586030071da64ea2e5013483f2e00f30181cbc5bb3c82805604586cc0dd71bb833424e98dd9c55be5fbec10bdc0cd5933feebc3168772b1447a99b009b2fb5ce11b2d0014fe3284c74ca3d2f1e0c6ba333904c77fb2eba96bc9e9fcf3b1b81e208780a0a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f586030078b15c91c6fb1a20db4edc382c50106349085f3f88923a6d8710ba122a8f159d3a50c82a579c0c9bc1722801d11f2e861ac68a90f7baf94dc9c1aac30818c30d1ebddd957dd10fa0604f24fd48d63cd63cb0bfed6fad885a0434ce79b72fac35a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603005b1af8d5d6ae623a1de2d74d4282bbba9b09954227dc7bdd509ae064c20046b9780db6b7af4bddd5831b336391879f6ed71b4def6927b2d6f1053c294d29b9041faef71df33e7172d97a8875b56b44831fdd4c06e9f80f756658aa3335dbdd05a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300972f8022f48b0555d22e1a6c8083c1a8b5a6a1a2d10531985cf9d3a8afafb8e8cd3ecf5758d87fd0fd89128763549a15535ce76b33c50485f5a9fbf02da0510b210f531a0e5b9507d10229f1249afae7bdc8c447b07d6b6c65071e49f3f231a0a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f586030035ffb77f068f15bbc0f1b3673922a3f3b351029391973b7a828917f5491253949ba7135a9b41a46e8fac70be11faa41f462f15eaaa89c8cadd55affb6713b201280b8b99b8be68986be6b172b4341552067beec39b1b5c791a04cb7b74ba17e2a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603004c2c7dc4b2d31d3ee11d259b93516fbf50480b6ed19acee923badecef0ce46f8ff0fb7c0528d0dc98dedcf411b08d2b7245b1c10eed3201201f2497bb213900f39d59d0846eb2ef5a3b4b601120f03785e487d935b3465568a8419272b2b177da60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f586030003794d3874daa15cc30ea8757c97f5d9ef70ff75fc44dacbc24ad0498aebe3bc5d9a6c4b3ec7b84c288b8e66d912d42cd86537e69e3ef5a8ee9211123fda97074256e0e88078da64bc9e5c2f14f84dc9199262f7b398014a31c125dbbbf26d57a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603003fa34ca1827aaf81d2f3813662ee66e2440760a91e71a81a2974d5fdf7bc5fe8d4a50d8a13875b9d3e838009fe35bf34b8ed417890d5f750a89b2bba9be77c0f4ee66173993dd0db5d628c4c9cb61a27b76611ad3c3925947f0d0011ee2c5dcca60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300626e3ffc58ed8e85da355e7fb6682d264a02f1f4b8a4500ed6ff77b427278179849aef7b528200bfa390cd3b55cefea5af85fa090a8b1bdef5bace6f14bbf30c56a80577f4498674df97e4a535ffd5f46fdbab6ff88be9455f7f16c0f3408c61a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300fb3e3d9435874b0e51d064b564eeb03a336488325a4d5101d12951b4d427df741e84fa4a38a105e5bde18606268d431e07db77d33b6d4138d5e47a32c661170a5e0be1e23e1878858411024b75ce979ecd871f79b387af86ecd5a95ec5b1fbeea60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603000c8d3be4be478f9fdd7e5436bf6e729666ddbdb5444fe158b827ce6d8e364cf81e402f511bd594b75f854ab1a3782c518938d7302e079aba0deb8d2e74d7580a6984b35ec83cfed8e0c15a9d856fe69ca09eaca2abd44dad787bdf094e6ccb30a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f586030053f9c1b5bbe25fdf0f1d484b08de15b609ba4003f970ba1d9572e8a61ebe8dedb6dacae4553fe26af7a97b63b7f06b238d167d891a4951f5e30b23a48caa920f6c878e33b83c20324238d22240f735457b6fba544b383e70bb62a27b57380c81a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300a379b0eaf1a3420273ec3b35bce6db5710f0d71f30019138665a2df9e5c9d51af269095ef4ca1c46bca67395b76874ff396a7458d1072de87f3383e6b50eb5076d15dbec297372df3a4b3aeaea61ea3528a0f56bcbf61b15e30558038d11a755a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603008759ecce1bf8b7b271d360a6133ac8053e1a6ea2486e006bc8676c187d62843515aca09021cd564b835a544ce2dc2d5323f1a9e7f5b4ed7590ab9307153ee3016d2117d8d8420bd8ce1ee394123dd2a8771909763fff8764900bb0414dfc59eba60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300ec02c961d6030d2e1128ce69fcc6b04b70553107f8b8175cd454459a34b293ad7a7c2d1e7302c966c0fac6b903981af25ebadd11d702aa0c690d8dfe37efe5017ddd6476c8f536c039f4fefc17cb35b5cce9b1785ef17939fa8aa58396719bd4a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603004e90ac06ce14eb69b087786e366b84c2e90c6fe6b4e14ae2a608899e03d27f46b10668d193c3f468d02f712d716fbc66d6a250b50351f960bf1c98a40af27e0b8120eb43544dbc3920cc81f17236733be1b240b671ac922c9148cac3c667731ea60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603001f03ac29ef6048dcfc74bb986c8d131c89172e967afc02a86075246deadd2228d613bc4893270b840824f55c6ef92cfcd3b04a783fb3c7890be10fa798245001868e9c7b526768f6f12a685b6ceb0fd47f476edb96fbebe9436423676ddb696aa60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300e7c98f196bf4627ca8cffdf3f62cd4996e8ac5e72c5617414194747207fc7a0b1300de2b05cdbc3a848ff9bc20c78927d92c176a80faaf55d0e0a92df7e9220dabfa61e70a50e53276dc3e9338bf9d3cd97fd4d1198fc78b54c790f099b33163a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300fe9e090454520395d68ef506eea7f7387a8944df0638c4367572e2c7e19e49bff8779f1df99a2e37da5ad036ede6feda6d24f78c5108b542a7a56b6e666dcd0db2a6d42d8be5e1e36c9e8989e25010a1958e11d96c3652aa1577fad1029cdca3a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603001825a262616745fd25d4e2028dbc4e3c348ad984bd008797b973a5f4a0629c79e094bbe349f6ec821e2c3cf0d606f80c716a5a2266657fcd8d11807eb9ea7c0ec2edfb8cd184dbb8ffc44d3f939a21123dcf6910dfe4093e03cfce2eec8634f2a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300d5ba40a8ef808c479c3cedaa2d625a45eba3a5f8e067d4daf92073f55c0d0b1b1138f59c650cb5326e7e16f877694569b6dd4ea0d0221fd39dd2b26ccc4b3703c343c7bee6911fd371ae4a089bcac85944a424f35e2822512511fc2d2969995ea60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300af1441eb8f55cadf5f5fbe76018bafab3722f801472cebb10c0fbe49757c726c568eab356a62192327a105500cc11feaf3c7fa3e0a28c0a92730f59d8e284a01c36117e07189608542ae4ef92fd84567d05ee6e32c24f9e5e7b951d99bbd1c69a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300ffc67342a626debfad726806d94df42868c49331811e1c7d3ca371b0f6a4e8a77ce47f619820b92fcf26875594de90f90e6a4a70ff7576b1438b4505a240900ad3e176c48d3a54df53e9c573236d6c57260ab2e6cb6f0ef26a0ae58a2599fdada60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f5860300bcae44a1bc36fea506c5ccc1b9fd2755aa4dd49c57c4eb2447178a70889b4531c10e24abfc4620d419cafa2f2c4b3ff18fc4eff68ea716bde54503819cb87b07d94312876b0161d299df8807bb61b5e4c0fddf9574a06716fc823c8d42c6a889a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f58603001e7725e0bb7755b783f186946275d6623e1ea9d2d19c01b3479f1892ae8a1ce67f6ecc3d0b8de58800440469fdb39a43b0d0c04066240ff8e7433e13289a990ddba43211c5f6fcf33043e13146beaf05242482ba100a3acd13524c5e397f7db7a60f733907f5311793f5cced83c7bab74656b279fcd422292f4707560d867e52f586030033ef3696bc82fefd42f1598809ad277a72a7edeb4ae52467ebc744ee7e322e6a5da76e471d440b5f59fca14b41b8567e456ab1e86393787cbbc9bb4abb888500e54f729d4278a7b542e6e0faac9d9122faee6ac212cd7559319bb5dce1e0087900";
    //     const header = await listener.rpc.chain.getHeader(
    //         await listener.rpc.chain.getBlockHash(231157)
    //     )

    //     submitProof(justification, header, gatewayId);
    // }

    async fetchIncomingGrandpaJustification(api: ApiPromise) {
        console.log("Started Grandpa Justification Listener...")
        let listener = await api.rpc.grandpa.subscribeJustifications(async (justification: any) => {
            console.log("Caught Justification!")
            let hex_justification = justification.toString().substring(2) // removes 0x
            const decodedVals:any = await new Promise((res, rej) => {
                return exec(`./rust_decode/target/release/decode_justification blocknumber ${hex_justification}`, (err, stdout, _) => {
                    if (err) {
                        throw err
                    }
                    if (stdout.includes("Error")) {
                        throw new Error("GrandpaJustification decoding failed!")
                    } 
                    return res(JSON.parse(stdout));
                });
            })
            this.conclude(api, justification, decodedVals)
            listener();
        })
    }

    async conclude(api: ApiPromise, justification: JustificationNotification, grandpaBlockNumber: number) {
        this.headerListener() // terminate header listener
        console.log("Headers found:", this.headers.length);

        let header = this.headers.find(header => {
            return header.number.toNumber() == grandpaBlockNumber
        });

        // console.log(header)
        // console.log(header.hash)

        
        await submitProof(justification, header, this.gatewayId, api);
        // this.delay();
        // const [headerProof, paraHeader] = await getHeaderProof(api, header.hash, 2004)
        // await submitHeaderProof(headerProof, [97, 98, 99, 100], [109, 111, 111, 110], paraHeader)
            
            
            // proof: any, relayId: number[], gatewayId: number[], headerHashRelay: string, headerPara: string) => {
    }

    async delay() {
        return new Promise<void>((res, rej) => {
            setTimeout(() => {
                res()
            }, 8000)
        })
    }
}
