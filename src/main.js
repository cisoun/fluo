import ChatBox from './chatbox.js';
import * as Brain from './brain.js';
import {version} from '../package.json';

function Bot (args) {
	const chatbox = new ChatBox(args);
	(args.container ?? document.body).appendChild(chatbox);
}

window.Fluo = {
	Bot,
	version,
	...Brain
};
