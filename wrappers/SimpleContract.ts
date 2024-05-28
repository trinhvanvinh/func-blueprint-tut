import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano,
} from '@ton/core';
import { crc32 } from '../helpers/crc32';

export type SimpleContractConfig = {
    value: number;
    publicKey: Buffer;
    ownerAddress: Address;
};

export const Opcodes = {
    setValue: crc32('set_value'),
};

export function simpleContractConfigToCell(config: SimpleContractConfig): Cell {
    return beginCell()
        .storeUint(config.value, 32)
        .storeBuffer(config.publicKey)
        .storeAddress(config.ownerAddress)
        .endCell();
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

    async sendValue(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: number;
            ownerAddress: Address;
        },
    ) {
        await provider.internal(via, {
            value: toNano(opts.value),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.setValue, 32)
                .storeUint(opts.value, 32)
                .storeAddress(opts.ownerAddress)
                .endCell(),
        });
    }

    async getValue(provider: ContractProvider): Promise<number> {
        const value = await provider.get('get_value', []);
        return value.stack.readNumber();
        //return 1;
    }
}
