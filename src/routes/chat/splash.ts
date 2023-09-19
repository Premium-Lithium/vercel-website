export let splashMessages = ["evie is booting up her neurons...","Assembling conversational frameworks...",
"Just a moment, evie is brushing up on her jokes...", "evie's checking her chat calendar. You're up next!",
"One moment! evie's feeding her virtual cat...", "evie's soaking up some solar rays. Almost ready...",
"Hold tight! evie's topping off her battery...", "evie's just checking her energy levels...",
"evie is plugging in. Just a sec!", "evie's charging up for a chat. Hang tight!", "evie's checking her battery. All set soon!",
"evie's feeling sunny today! Ready to chat?", "evie's almost charged up! Let's talk energy!", "Plugging into the grid. Hang tight!"
].map((x) => {return x.replace("evie", "<span style='color: var(--plblue)' >evie</span>")});
// Randomise splashMessages
splashMessages.sort(() => Math.random() - 0.5);
