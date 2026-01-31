export * as eight_ball from './8ball.ts';

export const flip = () => (Math.random() > 0.5 ? 'heads' : 'tails');
export const roll = () => Math.floor(Math.random() * 6) + 1;
