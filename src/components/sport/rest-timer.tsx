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
		<details className="group rounded-lg border border-ivory/15 bg-ivory text-night">
			<summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none transition hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/25 sm:px-5 [&::-webkit-details-marker]:hidden">
				<span>
					<span className="block text-xs font-semibold uppercase tracking-[0.16em] text-night/44">Outils rapides</span>
					<span className="mt-1 block text-base font-semibold text-night">Timer de repos</span>
				</span>
				<span className="flex items-center gap-3">
					<span className="tabular-nums text-lg font-semibold leading-none text-night" aria-live="polite">
						{formatTime(remainingSeconds)}
					</span>
					<span aria-hidden="true" className="text-xl leading-none text-night/44 transition group-open:rotate-45">
						+
					</span>
				</span>
			</summary>

			<div className="border-t border-night/10 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
				<div className="grid grid-cols-4 gap-2 sm:grid-cols-2">
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
			</div>
		</details>
	);
}
