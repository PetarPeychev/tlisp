import { Environment } from './environment';

type AST = number | string | AST[];

export class Interpreter {
    readonly environment: Environment;

    constructor(env?: Environment) {
        this.environment = env || Environment.default();
    }

    public evaluate(statement: string): number {
        let tokens = this.tokenize(statement);
        let ast = this.parse(tokens);
        return this.eval(ast);
    }

    private tokenize(statement: string): string[] {
        return statement
            .replaceAll('(', ' ( ')
            .replaceAll(')', ' ) ')
            .split(' ')
            .filter((token) => token !== '');
    }

    private parse(tokens: string[]): AST {
        let token = tokens.shift();
        if (token === undefined) {
            throw new SyntaxError("Unexpected EOF");
        }

        if (token === '(') {
            let list = [];
            while (tokens[0] !== ')') {
                list.push(this.parse(tokens));
            }
            tokens.shift();
            return list;
        } else if (token === ')') {
            throw new SyntaxError("Unexpected ')'");
        } else {
            return this.parse_atom(token);
        }
    }

    private parse_atom(token: string): number | string {
        if (!isNaN(Number(token))) {
            return Number(token);
        } else {
            return token;
        }
    }

    private eval(ast: AST): number {
        if (typeof ast === 'number') {
            return ast;
        } else if (typeof ast === 'string') {
            let value = this.environment.get(ast);
            if (value === undefined) {
                throw new SyntaxError(`Undefined symbol: ${ast}`);
            }
            return this.eval(value);
        } else {
            let [fn, ...args] = ast;
            if (typeof fn !== 'string') {
                throw new SyntaxError("Expected function name");
            }
            return this.environment.get(fn)(...args.map((arg: any) => this.eval(arg)));
        }
    }
}
