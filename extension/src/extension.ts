// $ts: extension.ts#2 $ $Change: 385917 $ $DateTime: 2018/12/05 11:52:14 $ $Author: yunjian.zhang $
// $NoKeywords: $
//
//  Copyright 2018 Autodesk, Inc.  All rights reserved.
//
//  Use of this software is subject to the terms of the Autodesk license 
//  agreement provided at the time of installation or download, or which 
//  otherwise accompanies this software in either electronic or hard copy form.   
//
// extension.ts
//
// CREATED BY:  yunjian.zhang               DECEMBER. 2018
//
// DESCRIPTION: Lisp vscode extension core code.
//
'use strict';
import * as vscode from 'vscode';

import {
	LanguageClient
} from 'vscode-languageclient';


import * as Diagnostics from './diagnosticsCtrl';
import { onUriRequested } from './uriHandler';

import * as formatProviders from './format/formatProviders'
import * as autoCompletionProvider from "./completion/autocompletionProvider"
import * as statusBar from "./statusbar"
import * as autoIndent from './format/autoIndent'

import * as DebugProviders from "./debug"
import * as pmCmds from "./project/projectCommands"

import * as nls from 'vscode-nls';

// The example uses the file message format.
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

let client: LanguageClient;

autoCompletionProvider.readAllBultinFunctions();

export function activate(context: vscode.ExtensionContext) {

	//-----------------------------------------------------------
	//1. lisp autoformat
	//-----------------------------------------------------------
	autoIndent.subscribeOnEnterEvent(); //auto indent

	formatProviders.registerDocumentFormatter();
	formatProviders.registeSelectionFormatter();

	autoCompletionProvider.registerAutoCompletionProviders();

	//-----------------------------------------------------------
	//2. lisp load button
	//-----------------------------------------------------------
	statusBar.registerLoadLispButton(context);

	//-----------------------------------------------------------
	//3. runtime diagnostics
	//-----------------------------------------------------------
	Diagnostics.registerDiagnosticHandler(context);

	//-----------------------------------------------------------
	//4. debug adapter
	DebugProviders.registerLispDebugProviders(context);

 	//-----------------------------------------------------------
    //5. register the handler to uri scheme: vscode://autodesk.autolispext?......
    vscode.window.registerUriHandler({
        handleUri(uri: vscode.Uri) {
            onUriRequested(uri);
        }
	});
	
	//-----------------------------------------------------------
	//6. register project commands
	pmCmds.registerProjectCommands(context);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}