import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type SimpleContractConfig = {
    value: number;
    // publicKey: Buffer,
    // ownerAddress: Address
};

export function simpleContractConfigToCell(config: SimpleContractConfig): Cell {
    return beginCell().storeUint(config.value, 32).endCell();
}

export class SimpleContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new SimpleContract(address);
    }

    static createFromConfig(config: SimpleContractConfig, code: Cell, workchain = 0) {
        const data = simpleContractConfigToCell(config);
        const init = { code, data };
        return new SimpleContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendValue(provider: ContractProvider, via: Sender, value: bigint) {
        console.log('-sendValue-: ', provider, via, value);
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).endCell(),
        });
    }

    async getValue(provider: ContractProvider) {
        const value = await provider.get('get_value', []);
        console.log('🚀 ~ SimpleContract ~ getValue ~ value:', value);
        return value;
    }
}
