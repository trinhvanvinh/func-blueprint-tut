import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { SimpleContract } from '../wrappers/SimpleContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import {KeyPair, mnemonicNew, mnemonicToPrivateKey} from '@ton/crypto';

async function randomKq(){
    let mnemonics = await mnemonicNew();
    return mnemonicToPrivateKey(mnemonics);
}

describe('SimpleContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SimpleContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let simpleContract: SandboxContract<SimpleContract>;
    let kp: KeyPair;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        kp = await randomKq();

        simpleContract = blockchain.openContract(SimpleContract.createFromConfig({
            value: 0,
          
        }, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await simpleContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: simpleContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and simpleContract are ready to use
    });

    it('set value', async () => {
        deployer = await blockchain.treasury('deployer');
        const setResult = await simpleContract.setValue(deployer.getSender(),{value: toNano('1')});
        expect(setResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: simpleContract.address,
            deploy: true,
            success: true,
        });

        //const value = await simpleContract.getValue();
        //console.log("value: ", value);
    });
});
