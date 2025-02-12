import ChatBox from './chatbox.js';
import * as Brain from './brain.js';
import {version} from '../package.json';

class Bot {
	constructor (args) {
		this.chatbox = new ChatBox(args);
		document.body.appendChild(this.chatbox);
	}
}

window.Fluo = {
	Bot,
	version,
	...Brain
};