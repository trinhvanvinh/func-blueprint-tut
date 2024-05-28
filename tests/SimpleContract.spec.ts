import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { SimpleContract } from '../wrappers/SimpleContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { KeyPair, mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { randomAddress } from '@ton/test-utils';

async function randomKq() {
    let mnemonics = await mnemonicNew();
    return mnemonicToPrivateKey(mnemonics);
}

describe('SimpleContract', () => {
    let code: Cell;
    let blockchain: Blockchain;
    let simpleContract: SandboxContract<SimpleContract>;
    let kp: KeyPair;
    let deployer: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        code = await compile('SimpleContract');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        kp = await randomKq();
        owner = await blockchain.treasury('owner');
        simpleContract = blockchain.openContract(
            SimpleContract.createFromConfig(
                {
                    value: 0,
                    publicKey: kp.publicKey,
                    ownerAddress: owner.address,
                },
                code,
            ),
        );

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

    it('should value', async () => {
        const sender = await blockchain.treasury('sender');
        const newOwnerAddress = randomAddress();
        const sendValueResult = await simpleContract.sendValue(sender.getSender(), {
            value: 12,
            ownerAddress: newOwnerAddress,
        });
        expect(sendValueResult.transactions).toHaveTransaction({
            from: sender.address,
            to: simpleContract.address,
            success: true,
        });

        const value = await simpleContract.getValue();
        console.log('value: ', value);
    });
});
