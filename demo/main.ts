// EQBL_aDC-DiNNbcSUD7W41vGbVP-SgUP3i4bQrsTs3HPmkru

import { getHttpEndpoint } from "@orbs-network/ton-access"
import { TonClient, WalletContractV4, fromNano, internal } from "ton"
import { mnemonicToWalletKey } from "ton-crypto"

async function main() {
    const mnemonic = 'black brass bid autumn novel shoulder item cloth insect impact strong rally emotion before cute echo sign child belt brisk planet supreme cart sell'
    const key = await mnemonicToWalletKey(mnemonic.split(' '))
    const wallet = WalletContractV4.create({publicKey: key.publicKey, workchain: 0})

    const endpoint = await getHttpEndpoint({network: 'testnet'})
    const client = new TonClient({endpoint})

    if(!await client.isContractDeployed(wallet.address)) {
        return console.log('wallet is not deployed')
    }

    const balance = await client.getBalance(wallet.address)
    console.log('balance: ', fromNano(balance))

    const walletContract = client.open(wallet)
    const seqno = await walletContract.getSeqno()

    await walletContract.createTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: 'EQChHpu8-rFBQyVCXJtT1aTwODTBc1dFUAEatbYy11ZLcBST',
                value: '0.05',
                body: 'Hello',
                bounce: false
            })
        ]
    })

    let currentSeqno = seqno
    while (currentSeqno == seqno) {
        console.log('waiting for transaction confirm...')
        await sleep(1500)
        currentSeqno = await walletContract.getSeqno()
    }

    console.log('transaction confirmed!')
}

main()

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}