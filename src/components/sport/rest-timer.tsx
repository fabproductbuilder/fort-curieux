"use client";

import { useEffect, useState } from "react";

const REST_DURATIONS = [
	{ label: "30 s", seconds: 30 },
	{ label: "1 min", seconds: 60 },
	{ label: "1 min 30", seconds: 90 },
	{ label: "2 min", seconds: 120 },
];

function formatTime(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function RestTimer() {
	const [selectedSeconds, setSelectedSeconds] = useState(60);
	const [remainingSeconds, setRemainingSeconds] = useState(60);
	const [isRunning, setIsRunning] = useState(false);

	useEffect(() => {
		if (!isRunning) {
			return;
		}

		const interval = window.setInterval(() => {
			setRemainingSeconds((current) => {
				if (current <= 1) {
					setIsRunning(false);
					return 0;
				}

				return current - 1;
			});
		}, 1000);

		return () => window.clearInterval(interval);
	}, [isRunning]);

	function selectDuration(seconds: number) {
		setSelectedSeconds(seconds);
		setRemainingSeconds(seconds);
		setIsRunning(false);
	}

	function startTimer() {
		setRemainingSeconds((current) => (current > 0 ? current : selectedSeconds));
		setIsRunning(true);
	}

	function pauseTimer() {
		setIsRunning(false);
	}

	function resetTimer() {
		setRemainingSeconds(selectedSeconds);
		setIsRunning(false);
	}

	return (
		<section className="rounded-lg border border-ivory/15 bg-ivory p-5 text-night">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-night/44">Outils rapides</p>
			<h2 className="mt-3 text-xl font-semibold">Timer de repos</h2>
			<p className="mt-4 tabular-nums text-4xl font-semibold text-night" aria-live="polite">
				{formatTime(remainingSeconds)}
			</p>

			<div className="mt-5 grid grid-cols-2 gap-2">
				{REST_DURATIONS.map((duration) => (
					<button
						key={duration.seconds}
						type="button"
						onClick={() => selectDuration(duration.seconds)}
						className={`h-10 rounded-md border px-3 text-sm font-semibold transition ${
							selectedSeconds === duration.seconds ? "border-accent bg-accent/18 text-night" : "border-night/15 text-night/70 hover:border-accent hover:text-night"
						}`}
					>
						{duration.label}
					</button>
				))}
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				<button type="button" onClick={startTimer} className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-night transition hover:bg-[#dc8440]">
					Démarrer
				</button>
				<button type="button" onClick={pauseTimer} className="h-10 rounded-md border border-night/15 px-4 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent">
					Pause
				</button>
				<button type="button" onClick={resetTimer} className="h-10 rounded-md border border-night/15 px-4 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent">
					Réinitialiser
				</button>
			</div>
		</section>
	);
}
