import css from './chatbox.css';
import html from './chatbox.html';
import {Brain} from './brain.js';

class ChatBox extends HTMLElement {
	constructor ({
		botName    = 'Fluo',
		model,
		title      = 'Fluo',
		userName   = 'You',
	}) {
		super();

		this.botName   = botName;
		this.model     = model;
		this.title     = title;
		this.userName  = userName;

		this.brain = new Brain(model);

		const shadowRoot     = this.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = `<style>${css}</style>${html}`;
	}

	connectedCallback () {
		this.chatBody         = this.shadowRoot.querySelector('#body');
		this.chatFooter       = this.shadowRoot.querySelector('#footer');
		this.chatHeader       = this.shadowRoot.querySelector('#header');
		this.chatImage        = this.shadowRoot.querySelector('#image');
		this.chatInputButtons = this.shadowRoot.querySelector('#input-buttons');
		this.chatInputText    = this.shadowRoot.querySelector('#input-text');
		this.chatPrompt       = this.shadowRoot.querySelector('#prompt');
		this.chatSend         = this.shadowRoot.querySelector('#send');
		this.messageTemplate  = this.shadowRoot.querySelector('#message-template');

		this.chatHeader.innerHTML = this.title;

		this.chatSend.addEventListener('click', (e) => {
			this.send(this.chatPrompt.value, 'agent');
		});

		this.chatImage.addEventListener('click', () => {
			this.chatImage.classList.remove('active');
		});

		document.addEventListener('reply', (e) => {
			this.handleResponse(e.detail);
		});

		this.showPrompt('text');

		this.brain.run();
	}

	addMessage (message, origin) {
		const element     = this.createMessage(origin);
		element.innerHTML = message;
		this.scrollToEnd();
	}

	addMessageWithImage (url, origin) {
		const element = this.createMessage(origin);
		const img     = document.createElement('img');
		img.src       = url;
		img.onload    = () => this.scrollToEnd();
		img.onclick   = () => {
			this.chatImage.src = url;
			this.chatImage.classList.add('active');
		}
		element.appendChild(img);
		this.scrollToEnd();
	}

	clearPrompt () {
		this.chatPrompt.value = '';
	}

	clearPromptButtons () {
		for (let i = this.chatInputButtons.children.length - 1; i >= 0; i--) {
			this.chatInputButtons.children[0].remove();
		}
		this.showPrompt('text');
	}

	createMessage (origin) {
		const nickname = origin == 'bot' ? this.botName : this.userName;
		const clone    = this.messageTemplate.content.cloneNode(true);
		const body     = clone.children[0];
		const date     = (new Date()).toLocaleTimeString();
		body.querySelector('.message-info').innerHTML = `${nickname} - ${date}`;
		body.classList.add(origin);
		this.chatBody.appendChild(clone);
		return body.querySelector('.message-content');
	}

	handleResponse (data) {
		const origin = 'bot';
		const {text, buttons, image} = data;
		if (text) {
			this.addMessage(text.replaceAll('\n', '<br>'), origin);
			this.showPrompt('text');
		} else if (image) {
			this.addMessageWithImage(image, origin);
		} else {
			this.promptButtons(...buttons);
		}
	}

	hidePrompt () {
		delete this.chatFooter.dataset.prompt;
	}

	promptButtons (...buttons) {
		this.showPrompt('buttons');
		for (const text of buttons) {
			const button = document.createElement('button');
			button.innerHTML = text;
			button.onclick = () => {
				this.send(text, 'user');
				this.clearPromptButtons();
			};
			this.chatInputButtons.appendChild(button);
		}
		this.scrollToEnd();
	}

	scrollToEnd () {
		this.chatBody.scrollTop = this.chatBody.scrollHeight;
	}

	send (message) {
		this.clearPrompt();
		this.addMessage(message, 'user');
		setTimeout(() => {
			this.brain.ask(message);
		}, 1000);

	};

	showPrompt (type) {
		this.chatFooter.dataset.prompt = type;
		if (type == 'text') {
			this.chatPrompt.focus();
		}
	}

	start () {
		this.container.appendChild(this);
	}
};

customElements.define('fluo-chatbox', ChatBox);

export default ChatBox;
