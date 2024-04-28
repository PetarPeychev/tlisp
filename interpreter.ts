import { Environment } from './environment';

type AST = number | string | boolean | null | AST[];

export class Interpreter {
    readonly environment: Environment;

    constructor(env?: Environment) {
        this.environment = env || Environment.default();
    }

    public evaluate(statement: string): number | boolean | null {
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

    private parse_atom(token: string): number | string | boolean | null {
        if (!isNaN(Number(token))) {
            return Number(token);
        } else if (token === 'true') {
            return true;
        }
        else if (token === 'false') {
            return false;
        }
        else if (token === 'null') {
            return null;
        }
        else {
            return token;
        }
    }

    private eval(ast: AST): number | boolean | null {
        if (typeof ast === 'number') {
            return ast;
        } else if (typeof ast === 'string') {
            let value = this.environment.get(ast);
            if (value === undefined) {
                throw new SyntaxError(`Undefined symbol: ${ast}`);
            }
            return this.eval(value);
        } else if (typeof ast === 'boolean') {
            return ast;
        } else if (ast === null) {
            return null;
        } else {
            let [fn, ...args] = ast;
            if (typeof fn !== 'string') {
                throw new SyntaxError("Expected procedure name");
            }

            if (fn === 'define') {
                let [name, value] = args;
                if (typeof name !== 'string') {
                    throw new SyntaxError("Expected symbol");
                }
                this.environment.set(name, this.eval(value));
                return null;
            }
            else if (fn === 'if') {
                let [condition, then, otherwise, ...rest] = args;
                if (
                    condition === undefined
                    || then === undefined
                    || otherwise === undefined
                    || rest.length > 0
                ) {
                    throw new SyntaxError("Expected 3 arguments");
                }
                let cond = this.eval(condition);
                if (cond === true) {
                    return this.eval(then);
                } else if (cond === false) {
                    return this.eval(otherwise);
                }
                else {
                    throw new TypeError("Expected boolean condition");
                }
            }
            else {
                return this.environment.get(fn)(...args.map(
                    (arg: any) => this.eval(arg)
                ));
            }
        }
    }
}
