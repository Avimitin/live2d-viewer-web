export function save(key: string) {
    return function(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        const set = descriptor.set!;

        descriptor.set = function(value: unknown) {
            set.call(this, value);
            saveValue(key, value);
        };

        const value = loadValue(key, descriptor.get!.call(target));
        set.call(target, value);
    };
}

export function saveValue<T = unknown>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function loadValue<T = unknown>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);

    if (data === null) {
        return defaultValue;
    }

    return JSON.parse(data);
}
