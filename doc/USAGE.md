# Usage

Let's start with a basic example.

Here, the bot greets you. If you repond "hello", the bot will ask your name and greet you again by your name. 
If the prompt is not recognized, the bot will just tell you that it did not understand.

```html
<!DOCTYPE html>
<html>
	<head>
		<script src="fluo.js" type="text/javascript"></script>
	</head>
	<body></body>
	<script>
		const {
			Bot,
			say,
			listen,
			input,
			when,
			goto,
			end
		} = Fluo;

		const model = {
			flows: {
				MAIN: [
					say ('Hello world!')
				],
				HELLO: [
					say   ('What is your name?'),
					input ('name'),
					say   ('Hello {{name}}!')
				],
				FAIL: [
					say ('I do not understand...')
				],
				UNKNOWN: [
					listen (),
					when   ('hello', goto('HELLO')),
					goto   ('FAIL')
				]
			}
		};

		const bot = new Bot({model, title: 'Fluo demo'});
	</script>
</html>
```

## Notes

- The bot always starts through `MAIN`. You can use this flow as welcome message.
- If the bot does not recognize the prompt, use the `UNKNOWN` flow to handle it.

## Bot parameters

- `model`: model to load.
- `title`: title of the bot, will be displayed in the header.
- `botName`: nickname of the bot. By default: "Fluo".
- `userName`: nickname of the user. By default: "You".
- `container`: container the bot will be attached to. By default: `document.body`.

## Bot commands

| Instruction           | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `listen`              | Wait for the user to prompt.                                 |
| `say(message)`        | Send message to user. Supports HTML code. Use `{{key}}` to print an user input (see the `input` instruction). |
| `goto(flow)`          | Switch to specified flow. This prevent the execution of the next instructions of the current flow. |
| `when(text, command)` | If last prompt is `text` execute `command`.                  |
| `buttons(...choices)` | Present choices as buttons to the user.                      |
| `wait(seconds)`       | Make the bot wait a given amount of seconds.                 |
| `image(url)`          | Present an image to the user.                                |
| `input(key)`          | Wait for the user to prompt and store the response as a given key. This can be used in a message between double braces. Example: `Hello {{name}}!`. |
| `end()`               | Stop the bot.                                                |