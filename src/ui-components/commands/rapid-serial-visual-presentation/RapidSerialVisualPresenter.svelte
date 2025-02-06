<script lang="ts">
	import { onMount } from "svelte";

	export let rsvpElements: string[] = [];
	export let elemIndex: number = 0;
	export let wordsPerMinute: number = 600;
	export let playing: boolean = true;

	export let isInFocus: () => boolean = () => true;

	let intervalTimer: NodeJS.Timer | null = null;

	$: currElem = rsvpElements[elemIndex];
	$: elemInterval = 60000 / wordsPerMinute;
	$: totalDuration = (rsvpElements.length * elemInterval) / 1000;
	$: currTime = (elemInterval * elemIndex) / 1000;

	export function play() {
		if (intervalTimer) return;
		playing = true;

		intervalTimer = setInterval(() => {
			elemIndex = elemIndex + 1;
			currElem = rsvpElements[elemIndex];

			if (elemIndex >= rsvpElements.length) {
				elemIndex = 0;
				pause();
			}
		}, elemInterval);
	}

	function run() {
		const delay = getIntervalTime();
		timerId = setTimeout(() => {
			callback();
			run(); // Schedule the next execution
		}, delay);
	}

	export function pause() {
		if (!intervalTimer) return;
		clearInterval(intervalTimer);
		intervalTimer = null;
		playing = false;
	}

	export function stop() {
		pause();
		elemIndex = 0;
		currElem = rsvpElements[elemIndex];
	}

	export function nextElem() {
		pause();
		elemIndex = elemIndex + 1;
		currElem = rsvpElements[elemIndex];
	}

	export function prevElem() {
		pause();
		elemIndex = elemIndex - 1;
		currElem = rsvpElements[elemIndex];
	}

	if (playing) play();

	function formatTime(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);

		// Pad with leading zeros if needed
		const formattedMinutes = String(minutes).padStart(2, "0");
		const formattedSeconds = String(remainingSeconds).padStart(2, "0");

		return `${formattedMinutes}:${formattedSeconds}`;
	}

	onMount(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!isInFocus()) return;

			if (event.key == " ") {
				if (playing) pause();
				else play();
			} else if (event.key == "ArrowRight") {
				nextElem();
			} else if (event.key == "ArrowLeft") {
				prevElem();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	});
</script>

<div class="container">
	<div class="elem-display">
		{@html currElem}
	</div>

	<div class="control-panel">
		<button on:click={play} class:btn-active={playing}>Play</button>
		<button on:click={pause} class:btn-active={!playing}>Pause</button>
		<button on:click={stop}>Stop</button>

		<button on:click={prevElem}>Prev</button>
		<button on:click={nextElem}>Next</button>

		<div class="slider-container">
			<b>Current time:</b>
			{formatTime(currTime)} <br />
			<b>Total duration:</b>
			{formatTime(totalDuration)}
			<input
				type="range"
				min="0"
				max={rsvpElements.length - 1}
				bind:value={elemIndex}
				class="horizontal-slider"
			/>
		</div>

		<div class="slider-container">
			<b>Words per minute:</b>

			<input
				type="number"
				min="10"
				max="1500"
				bind:value={wordsPerMinute}
				on:input={() => {
					pause();
					play();
				}}
				class="number-input"
			/>

			<input
				type="range"
				min="10"
				max="1500"
				bind:value={wordsPerMinute}
				on:input={() => {
					pause();
					play();
				}}
				class="horizontal-slider"
			/>
		</div>
	</div>
</div>

<style>
	.elem-display {
		font-size: 5em;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;

		flex: 1; /* Takes up remaining space */
		border: 1px solid white; /* Just for visualization */
		border-radius: 10px;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100%; /* Full viewport height */
	}

	.control-panel {
		margin-top: 15px;
		border: 1px solid white; /* Just for visualization */
		border-radius: 10px;
		padding: 20px; /* Adjust as needed */
	}

	.horizontal-slider {
		display: block;
		width: 100%;
		margin-top: 20px;
		margin-bottom: 20px;
	}

	.btn-active {
		background-color: #007bff;
	}

	.slider-container {
		margin-top: 10px;
		margin-bottom: 10px;
	}
</style>
