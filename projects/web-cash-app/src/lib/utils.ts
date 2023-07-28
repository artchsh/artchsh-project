export function combClass(...args: string[]) {
    return args.filter((value, index) => {
        const newValue = structuredClone(value)
        if (value.startsWith(" ")) {
            newValue.split("")[0] = ""
        }
        return newValue ? newValue : null
    }).join(" ")
}