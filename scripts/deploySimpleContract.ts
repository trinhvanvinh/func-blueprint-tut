import { Address, toNano } from '@ton/core';
import { SimpleContract } from '../wrappers/SimpleContract';
import { compile, NetworkProvider } from '@ton/blueprint';
import { createKeys } from '../helpers/keys';

export async function run(provider: NetworkProvider) {
    const simpleContract = provider.open(
        SimpleContract.createFromConfig(
            {
                value: 1,
                publicKey: (await createKeys()).publicKey,
                ownerAddress: Address.parse('UQBs8mtfp5xl1Fn-eHdDjV1wiOWCkk_9-4DgKiwj4SifHs3V'),
            },
            await compile('SimpleContract'),
        ),
    );

    await simpleContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(simpleContract.address);

    // run methods on `simpleContract`
}
