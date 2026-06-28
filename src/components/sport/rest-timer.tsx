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
		<section className="rounded-lg border border-ivory/15 bg-ivory p-4 text-night sm:p-5">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-night/44">Outils rapides</p>
			<div className="mt-3 flex items-end justify-between gap-4">
				<h2 className="text-lg font-semibold sm:text-xl">Timer de repos</h2>
				<p className="tabular-nums text-3xl font-semibold leading-none text-night sm:text-4xl" aria-live="polite">
					{formatTime(remainingSeconds)}
				</p>
			</div>

			<div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-2">
				{REST_DURATIONS.map((duration) => (
					<button
						key={duration.seconds}
						type="button"
						onClick={() => selectDuration(duration.seconds)}
						className={`h-11 rounded-md border px-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
							selectedSeconds === duration.seconds ? "border-accent bg-accent/18 text-night" : "border-night/15 text-night/70 hover:border-accent hover:text-night"
						}`}
					>
						{duration.label}
					</button>
				))}
			</div>

			<div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
				<button type="button" onClick={startTimer} className="h-11 rounded-md bg-accent px-3 text-sm font-semibold text-night transition hover:bg-[#dc8440] sm:px-4">
					Démarrer
				</button>
				<button type="button" onClick={pauseTimer} className="h-11 rounded-md border border-night/15 px-3 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent sm:px-4">
					Pause
				</button>
				<button type="button" onClick={resetTimer} className="col-span-2 h-11 rounded-md border border-night/15 px-3 text-sm font-semibold text-night/72 transition hover:border-accent hover:text-accent sm:col-span-1 sm:px-4">
					Réinitialiser
				</button>
			</div>
		</section>
	);
}
