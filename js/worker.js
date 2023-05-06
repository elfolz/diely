var int

start = () => {
	const startTime = performance.now()
	int = setInterval(() => {
		postMessage(performance.now() - startTime)
	}, 250)
}

stop = () => {
	clearInterval(int)
	postMessage(0)
}

onmessage = e => {
	if (e.data == 'start') start()
	if (e.data == 'stop') stop()
}