const bip39 = require("bip39");
const Web3 = require("web3")
const ethers = require('ethers');
const ContractKit = require('@celo/contractkit')
const aes256 = require('aes256');

const web3 = new Web3('https://alfajores-forno.celo-testnet.org')
const kit = ContractKit.newKitFromWeb3(web3)



const getNewMnemonic = ()=>{
    return bip39.generateMnemonic(256);
}

const retrieveAccountDetailsFromMnemonic = (mnemonic)=>{
    var wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return {
        "address" : wallet.address,
        "privateKey" : wallet.privateKey,
        "publicKey" : wallet.publicKey
    }
}

const encryptMnemonicWithPasscode = (mnemonic, passphase)=>{
    return aes256.encrypt(passphase, mnemonic);
}

const decryptMnemonicWithPasscode = (mnemonicEncrypted, passphase)=>{
    var result =  aes256.decrypt(passphase,mnemonicEncrypted);
    if(!bip39.validateMnemonic(result)) throw Error("Decryption Failed");
    return result; 
}

const getBalanceByAddress = async (address)=>{
    let stabletoken = await kit.contracts.getStableToken();
    let cUSDBalance = await stabletoken.balanceOf(address);
    // console.log(cUSDBalance.toString());
    return cUSDBalance;
}

const sendINR = async(fromAddress, privateKey, toAddress, amount)=>{
        // const oneDollar = BigNumber("1e18");
        // We are using a static data and relation betweeen INR and CUSD
        var amountIndollar = amount/75;
        // const toBeTrasferAmount = oneDollar.times(amountIndollar);

        kit.connection.addAccount(privateKey)  
        let stabletoken = await kit.contracts.getStableToken()
        let cUSDtx = await stabletoken.transfer(toAddress, ethers.utils.parseEther(amountIndollar.toString())).send({from: fromAddress, feeCurrency: stabletoken.address})
        let cUSDReceipt = await cUSDtx.waitReceipt()

        console.log(cUSDReceipt);
    
        console.log('cUSD Transaction receipt: %o', cUSDReceipt)
    
        // let cUSDBalance = await stabletoken.balanceOf(fromAddress)
    
        // console.log(`Your new account cUSD balance: ${cUSDBalance.toString()}`)

        return cUSDReceipt;
}

// console.log(getNewMnemonic());
// console.log(retrieveAccountDetailsFromMnemonic("october boss raven hip twenty gold behind talk close february bomb cricket that agent payment vapor trim peace ready guard wrong panel miss bean"));
// console.log(encryptMnemonicWithPasscode("october boss raven hip twenty gold behind talk close february bomb cricket that agent payment vapor trim peace ready guard wrong panel miss bean","7074785902"))
// console.log(decryptMnemonicWithPasscode("w+p4ba4L8pxEjwRVdu0BnAU8apNtaLe6rwKwKke2oaAk41vtfI+M0o8RvsuRrNXmd5NUWIi/wb4/cgGwcZ1yXHvJyluPbzkgwX4IoZntsAR+2EUq/iZyZpAuN/++UJWDSK5NhfGHM8acetoDB0d/TDB94SlCyyOBCimZ0OOubOc+F1SXaIAHmuD3oH9huMzhyQfg9QXHpQWuHhD/Vk9jgw==","7074785902"))

// console.log(getBalanceByAddress("0x00e19404fA2AFB15232ACC4c74Ba29247316c009"))
// sendINR("0x00e19404fA2AFB15232ACC4c74Ba29247316c009","0x595e1960731ef4a90cbccda450bb50862a124902671eade86ffa056dbca74775","0x4d06d902afdecde9a85564aaff8fc2a835db7e0c",20)

// const oneGold = kit.connection.web3.utils.toWei('1', 'ether')
// console.log(oneGold)

export {
    getNewMnemonic,
    getBalanceByAddress,
    retrieveAccountDetailsFromMnemonic,
    sendINR,
    encryptMnemonicWithPasscode,
    decryptMnemonicWithPasscode,
}