export function cn(...args: string[]) { return args.filter(Boolean).join(" ") }
export const transitionClass = 'transition-all ease-in-out'
export const buttonBaseClass = cn('px-3 py-2 bg-white text-black border-2 border-white uppercase font-semibold cursor-pointer hover:bg-black hover:text-white active:scale-95 select-none duration-700', transitionClass)
