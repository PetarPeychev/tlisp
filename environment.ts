type Value = number | string | boolean | null | Value[] | ((...args: Value[]) => Value);

export class Environment extends Map<string, Value> {
    private parent: Environment | null;

    constructor(parent?: Environment) {
        super();
        this.parent = parent || null;
    }

    public get(key: string): any {
        let value = super.get(key);
        if (value === undefined && this.parent !== null) {
            return this.parent.get(key);
        }
        return value;
    }

    public set(key: string, value: any): this {
        super.set(key, value);
        return this;
    }

    static default(): Environment {
        let env = new Environment();
        env.set('+', (a: number, b: number) => a + b);
        env.set('-', (a: number, b: number) => a - b);
        env.set('*', (a: number, b: number) => a * b);
        env.set('/', (a: number, b: number) => a / b);
        return env;
    }
}
