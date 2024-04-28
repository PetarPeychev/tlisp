import readline from 'readline';
import { Interpreter } from './interpreter';

const VERSION = "0.0.1";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`TLisp v${VERSION}\n`);
console.log("For help, type :help");
console.log("Press Ctrl+C or type :exit to Exit\n");
process.stdout.write("> ");

const interpreter = new Interpreter();

rl.on('line', (line) => {
    console.log(line);
    if (line === ":exit") {
        rl.close();
        return;
    }
    try {
        let value = interpreter.evaluate(line);
        if (typeof value === 'string') {
            console.log(`"${value}": string`);
        }
        else if (typeof value === 'number') {
            console.log(`${value}: number`);
        }
        else if (value === null) {
            console.log("null");
        }
    } catch (e) {
        let message = 'Unknown Error'
        if (e instanceof Error) message = e.message
        console.log(message);
    }
    process.stdout.write("> ");
});
