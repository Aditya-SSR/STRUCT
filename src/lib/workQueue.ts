/**
 * Frame-budgeted work queue for expensive DOM setup (SplitText + RESOLVE timelines, canvas sampling).
 * Mounting a page with dozens of reveals used to run them all synchronously in one commit, each forcing a full
 * layout. Now work is pulled off a queue a little per frame, "soon" tasks (near the viewport) first and
 * "idle" tasks only when the browser has nothing better to do.
 */
type Task = { run: () => void; dead: boolean };

const soon: Task[] = [];
const idle: Task[] = [];
let raf = 0;
let idleScheduled = false;

const BUDGET_MS = 7;

function pump() {
  raf = 0;
  const t0 = performance.now();
  while (soon.length) {
    const t = soon.shift()!;
    if (!t.dead) t.run();
    if (performance.now() - t0 > BUDGET_MS) break; // always runs at least one task per frame
  }
  if (soon.length) raf = requestAnimationFrame(pump);
}

function pumpIdle(deadline?: { timeRemaining: () => number }) {
  idleScheduled = false;
  const t0 = performance.now();
  while (idle.length) {
    const t = idle.shift()!;
    if (!t.dead) t.run();
    if (deadline ? deadline.timeRemaining() < 2 : performance.now() - t0 > BUDGET_MS) break;
  }
  if (idle.length) scheduleIdle();
}

function scheduleIdle() {
  if (idleScheduled) return;
  idleScheduled = true;
  if ("requestIdleCallback" in window) window.requestIdleCallback(pumpIdle, { timeout: 1500 });
  else setTimeout(() => pumpIdle(), 120);
}

/** Queue `run`. priority "soon" = next frame(s); "idle" = when the main thread is free. Returns a cancel fn. */
export function enqueue(run: () => void, priority: "soon" | "idle" = "soon") {
  const task: Task = { run, dead: false };
  if (priority === "soon") {
    soon.push(task);
    if (!raf) raf = requestAnimationFrame(pump);
  } else {
    idle.push(task);
    scheduleIdle();
  }
  return () => {
    task.dead = true;
  };
}
