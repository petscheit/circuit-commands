const { cryptoWaitReady, decodeAddress, signatureVerify } = require('@polkadot/util-crypto');
const { u8aToHex } = require('@polkadot/util');

  const isValidSignature = (signedMessage, signature, address) => {
    const publicKey = decodeAddress(address);
    const hexPublicKey = u8aToHex(publicKey);
  
    return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
  };

  const main = async () => {
    await cryptoWaitReady();
    
    const isValid = isValidSignature(
        "0x086c7554f16db99ac1e095aa2aeaf5e6b49b37234eea807c39001c91783815bd",
        "0x831fcdca8e8b00be30453c1a3f9b3aa033b64b3f9edc55a13e2b9adf81f607c81b1326526f1bed2c9e5aafda1648d5e0cdd9612973f058f5b92c77f454f31f0e",
        "0x038893749e3cf628920efc22288ecec8925e3b48eea5c76c8cda4363f8bf6c3d"
      );
    // output the result
    console.log(isValid);
  }
  
  main();