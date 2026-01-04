export function padNumber(value, length = 2) {
    return String(value).padStart(length, '0');
}

export function ordinalSuffix(value) {
    const remainder = value % 100;
    if (remainder >= 11 && remainder <= 13) {
        return `${value}th`;
    }
    switch (value % 10) {
        case 1:
            return `${value}st`;
        case 2:
            return `${value}nd`;
        case 3:
            return `${value}rd`;
        default:
            return `${value}th`;
    }
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function debounce(fn, delay = 500) {
    let timerId;
    return (...args) => {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => fn(...args), delay);
    };
}

export function toTitleCase(value) {
    if (!value) {
        return value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function randomChoice(list) {
    return list[Math.floor(Math.random() * list.length)];
}
