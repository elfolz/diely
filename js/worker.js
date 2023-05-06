var int

start = () => {
	const startTime = performance.now()
	int = setInterval(() => {
		postMessage(performance.now() - startTime)
	}, 250)
}

stop = () => {
	postMessage(0)
	clearInterval(int)
}

onmessage = e => {
	if (e.data == 'start') start()
	if (e.data == 'stop') stop()
}