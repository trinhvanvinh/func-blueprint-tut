import { toNano } from '@ton/core';
import { SimpleContract } from '../wrappers/SimpleContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const simpleContract = provider.open(
        SimpleContract.createFromConfig({ value: 1 }, await compile('SimpleContract')),
    );

    await simpleContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(simpleContract.address);

    // run methods on `simpleContract`
}
