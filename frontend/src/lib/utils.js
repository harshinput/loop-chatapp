export function formalMessageTime(date) {
    return new Date(date).toLocaleString([], {
        hour: "numeric",
        minute: "2-digit"
    })
}