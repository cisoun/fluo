const LISTEN  = 0;
const SAY     = 1;
const GOTO    = 2;
const IF      = 3;
const BUTTONS = 4;
const WAIT    = 5;
const IMAGE   = 6;
const END     = 7;
const INPUT   = 8;

const buttons = (...b)   => [BUTTONS, ...b];
const goto    = (f)      => [GOTO, f];
const image   = (i)      => [IMAGE, i];
const listen  = ()       => [LISTEN];
const say     = (m)      => [SAY, m];
const wait    = (s)      => [WAIT, s];
const when    = (m, cmd) => [IF, m, cmd];
const end     = ()       => [END];
const input   = (p)      => [INPUT, p];

const RX_ARG = new RegExp(/\{\{([a-zA-Z]+)\}\}/g);

class Brain {
	constructor (model) {
		if (typeof model != 'object') {
			console.error('[fluo] bot model is invalid');
			this.running = 0;
			return;
		}

		this.model = model;

		this.flow    = 'MAIN'; // Current flow.
		this.input   = null;   // Current input expected. `
		this.payload = {};     // Conversation data.
		this.prompt  = null;   // Last prompt sent by user.
		this.running = 1;      // Is the bot running?
		this.step    = 0;      // Current step of the flow.
	}

	ask (text) {
		if (!this.running) {
			return;
		}
		if (this.input != null) {
			this.payload[this.input] = text;
			this.input = null;
		}
		this.prompt = text.trim().toLowerCase();
		// Delay response to humanize.
		setTimeout(() => {
			this.run();
		}, 1000);
	}

	/**
	 * Execute the current command.
	 *
	 * Returns:
	 *  0: bot must wait for prompt.
	 *  1: bot must continue to next command.
	 */
	async execute (cmd) {
		const [id, ...args] = cmd;
		switch (id) {
			case LISTEN:
				this.step++;
				return 0;
			case SAY:
				this.reply({text: args[0]});
				return 1;
			case GOTO:
				this.flow = args[0];
				this.step = -1;
				return 1;
			case IF:
				const [prompt, next] = args;
				if (this.prompt.toLowerCase().match(prompt)) {
					this.execute(next);
				}
				return 1;
			case BUTTONS:
				this.reply({buttons: args});
				return 1;
			case WAIT:
				const seconds = args[0];
				await this.pause(seconds);
				return 1;
			case IMAGE:
				const url = args[0];
				this.reply({image: url});
				return 1;
			case INPUT:
				this.input = args[0];
				this.step++;
				return 0;
			case END:
				this.running = 0;
				return 0;
			default: return 0;
		}
	}

	async run () {
		if (!this.running) {
			return;
		}
		let next = 1;
		while (next) {
			const cmd = this.model.flows[this.flow][this.step];
			if (cmd) {
				console.log({flow: this.flow, step: this.step, cmd: cmd});
				next = await this.execute(cmd);
				this.step += next;
			}	else {
				this.flow = 'UNKNOWN';
				this.step = 0;
				next = 1;
			}
		}
	}

	async pause (seconds) {
		await new Promise(resolve => setTimeout(resolve, seconds * 1000));
	}

	reply (detail) {
		const { text } = detail;
		if (text) {
			detail.text = text.replaceAll(RX_ARG, (m, p1) => this.payload[p1]);
		}
		document.dispatchEvent(new CustomEvent('reply', {detail}));
	}
};

export {
	Brain,
	buttons,
	goto,
	image,
	listen,
	say,
	wait,
	when,
	input,
	end
};
