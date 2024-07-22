export const waitFor = (
  fn: () => any,
  { interval = 100, timeout = 2500, timeoutMessage = '' } = {}
): Promise<void> => {
  return new Promise((res, rej) => {
    const ctx: {
      timeoutError: string | Error;
      timeoutId: ReturnType<typeof setTimeout> | undefined;
      intervalId: ReturnType<typeof setInterval> | undefined;
    } = {
      timeoutError: timeoutMessage && new Error(timeoutMessage),
      timeoutId: undefined,
      intervalId: undefined,
    };

    ctx.timeoutId = setTimeout(() => {
      if (ctx.intervalId) {
        clearInterval(ctx.intervalId);
      }
      ctx.intervalId = undefined; // clear intervalId so awaited fns don't resolve after rejection
      rej(
        ctx.timeoutError ||
          new Error('waitFor timed out, passed function might be hanging')
      );
    }, timeout);

    ctx.intervalId = setInterval(async () => {
      try {
        await fn();
      } catch (e) {
        if (!timeoutMessage) {
          ctx.timeoutError = e as string;
        }
        return;
      }
      if (ctx.timeoutId) clearTimeout(ctx.timeoutId);
      if (ctx.intervalId) {
        clearInterval(ctx.intervalId);
        res();
      }
    }, interval);
  });
};
