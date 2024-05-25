import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { SimpleContract } from '../wrappers/SimpleContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('SimpleContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SimpleContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let simpleContract: SandboxContract<SimpleContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        simpleContract = blockchain.openContract(SimpleContract.createFromConfig({}, code));

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
});
