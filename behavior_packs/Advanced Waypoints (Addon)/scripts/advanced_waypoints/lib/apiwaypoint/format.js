export function sameNames(name, waypoints, excludeAt) {
    if (excludeAt)
        waypoints.splice(excludeAt, 1);
    let newName = name;
    let counter = 1;
    while (waypoints.includes(newName)) {
        newName = `${name} (${counter})`;
        counter++;
    }
    return newName;
}
