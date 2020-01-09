import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';

let internalLispFuncs: Array<String> = [];
let internalDclKeys: Array<String> = [];
let winOnlyListFuncPrefix: Array<string> = [];

export function readAllBultinFunctions() {
    var fs = require("fs");
    var lispkeyspath = path.resolve(__dirname, "../../data/alllispkeys.txt");
    fs.readFile(lispkeyspath, "utf8", function(err, data) {
        if (err === null) {
            if (data.includes("\r\n")) {
                internalLispFuncs = data.split("\r\n");
            }
            else {
                internalLispFuncs = data.split("\n");
            }
        }
    });
    var dclkeyspath = path.resolve(__dirname, "../../data/alldclkeys.txt");
    fs.readFile(dclkeyspath, "utf8", function(err, data) {
        if (err === null) {
            if (data.includes("\r\n")) {
                internalDclKeys = data.split("\r\n");
            }
            else {
                internalDclKeys = data.split("\n");
            }
        }
    });

    var winonlyprefixpath = path.resolve(__dirname, "../data/winonlylispkeys_prefix.txt");
    fs.readFile(winonlyprefixpath, "utf8", function(err, data) {
        if (err == null) {
            if (data.includes("\r\n")) {
                winOnlyListFuncPrefix = data.split("\r\n");
            }
            else {
                winOnlyListFuncPrefix = data.split("\n");
            }
        }
    });

}

export function registerAutoCompletionProviders() {
    vscode.languages.registerCompletionItemProvider(['autolisp', 'lsp', 'autolispdcl'], {

        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

            let currentLSPDoc = document.fileName;
            let ext = currentLSPDoc.substring(currentLSPDoc.length - 4, currentLSPDoc.length).toUpperCase();
            let candidatesItems = internalLispFuncs;
            if (ext === ".DCL") {
                candidatesItems = internalDclKeys;
            }

            // If it is in comments, it doesn't need to provide lisp autocomplete
            let linetext = document.lineAt(position).text;
            if (linetext.startsWith(";") || linetext.startsWith(";;")
                || linetext.startsWith("#|") || linetext.startsWith("|#")) {
                return;
            }

            let word = document.getText(document.getWordRangeAtPosition(position));
            let wordSep = " &#^()[]|;'\".";
            // Maybe has some issues for matching first item
            let pos = linetext.indexOf(word);
            pos--;
            let length = 0;
            for (; pos >= 0; pos--) {
                if (linetext.length <= pos)
                    break;
                let ch = linetext.charAt(pos);
                if (wordSep.includes(ch)) {
                    word = linetext.substr(pos + 1, word.length + length);
                    break;
                }
                length++;
            }

            let allSuggestions: Array<vscode.CompletionItem> = [];
            word = word.toLowerCase();

            candidatesItems.forEach((item) => {
                if (item.startsWith(word) || item.endsWith(word)) {
                    const completion = new vscode.CompletionItem(item.toString());
                    allSuggestions.push(completion);
                }
            });

            if (os.platform() === "win32") {
                return allSuggestions;
            }
            else {
                return allSuggestions.filter(function(suggestion) {
                    for (var prefix of winOnlyListFuncPrefix) {
                        if (suggestion.label.startsWith(prefix)) {
                            return false;
                        }
                    }
                    return true;
                });
            }
        }
    });
}